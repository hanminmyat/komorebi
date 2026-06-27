import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import LogoutButton from "@/components/LogoutButton";
import AudioRecorder from "@/components/AudioRecorder";
import ImageUploader from "@/components/ImageUploader";
import CapsuleMediaAlbum from "@/components/CapsuleMediaAlbum";
import Logo from "@/components/Logo";
import ToggleActions from "@/components/ToggleActions";

const MAX_IMAGES = 10;
const MAX_AUDIO = 1;

const typeColors: Record<string, string> = {
  audio: "bg-sky/15 text-sky",
  photo: "bg-leaf/15 text-leaf",
  mixed: "bg-blossom/15 text-blossom",
};

// Skeleton loader for the album section
function AlbumSkeleton() {
  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-5 break-inside-animate">
          <div className="animate-pulse rounded-sm bg-border/50 p-2.5 pb-8 sm:p-3 sm:pb-10">
            <div className="aspect-[4/3] w-full rounded-[2px] bg-border" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function CapsuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userId = user.id;

  // Run profile + capsule + media counts in parallel
  // Counts use head:true to avoid fetching rows — only the count metadata is returned
  const [
    { data: profile },
    { data: capsule },
    { count: imageCount },
    { count: audioCount },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", userId).single(),
    supabase.from("capsules").select("*").eq("id", id).eq("user_id", userId).single(),
    supabase.from("media_items").select("id", { count: "exact", head: true }).eq("capsule_id", id).eq("type", "image"),
    supabase.from("media_items").select("id", { count: "exact", head: true }).eq("capsule_id", id).eq("type", "audio"),
  ]);

  if (!capsule) {
    notFound();
  }

  const firstName = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";
  const safeImageCount = imageCount ?? 0;
  const safeAudioCount = audioCount ?? 0;
  const mediaCount = safeImageCount + safeAudioCount;

  const canAddImage = safeImageCount < MAX_IMAGES;
  const canAddAudio = safeAudioCount < MAX_AUDIO;

  const showImageUploader =
    canAddImage && (capsule.type === "photo" || capsule.type === "mixed");
  const showAudioRecorder =
    canAddAudio && (capsule.type === "audio" || capsule.type === "mixed");

  const displayDate = capsule.memory_date
    ? new Date(capsule.memory_date + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const createdDate = new Date(capsule.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <Logo size="sm" href="/dashboard" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-xs font-semibold">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:inline">{profile?.full_name || user.email}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {/* Album Cover Card */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg shadow-black/5 sm:mb-8">
          <div className="relative p-4 pb-3 sm:p-5 sm:pb-3 lg:p-6 lg:pb-4">
            {/* Badges row */}
            <div className="mb-2 flex flex-wrap items-center gap-2 pr-8">
              {displayDate ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted sm:text-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  {displayDate}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 text-xs text-muted sm:text-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  Date unknown
                </div>
              )}
              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
                typeColors[capsule.type] || "bg-surface text-muted"
              }`}>
                {capsule.type}
              </span>
              <span className="text-xs text-muted">{createdDate}</span>
              <span className="text-xs text-muted">
                {safeImageCount} photo{safeImageCount !== 1 ? "s" : ""} · {safeAudioCount} recording{safeAudioCount !== 1 ? "s" : ""}
              </span>
            </div>

            <h1 className="text-lg font-bold leading-tight text-foreground sm:text-xl lg:text-2xl">
              {capsule.title}
            </h1>

            {capsule.description && (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
                {capsule.description}
              </p>
            )}

            {/* Toggle + collapsible actions */}
            <ToggleActions capsule={capsule} />
          </div>
        </div>

        {/* Album Spread — streams in via Suspense */}
        <section className="mb-8 sm:mb-10">
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <h2 className="text-base font-semibold text-foreground sm:text-lg">Album</h2>
            <div className="flex items-center gap-3 text-xs text-muted sm:gap-4 sm:text-sm">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                {safeImageCount}/{MAX_IMAGES}
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
                {safeAudioCount}/{MAX_AUDIO}
              </span>
            </div>
          </div>

          <Suspense fallback={<AlbumSkeleton />}>
            <CapsuleMediaAlbum capsuleId={capsule.id} userId={userId} />
          </Suspense>
        </section>

        {/* Add to Album */}
        {(showImageUploader || showAudioRecorder) && (
          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6 lg:p-8">
            <h2 className="mb-4 text-base font-semibold text-foreground sm:mb-6 sm:text-lg">Add to this album</h2>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              {showImageUploader && (
                <div>
                  <ImageUploader capsuleId={capsule.id} imageCount={safeImageCount} />
                </div>
              )}
              {showAudioRecorder && (
                <div>
                  <AudioRecorder capsuleId={capsule.id} audioCount={safeAudioCount} />
                </div>
              )}
            </div>
          </section>
        )}

        {!showImageUploader && !showAudioRecorder && mediaCount > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-4 text-center sm:p-6">
            <p className="text-sm text-muted">
              Album is full — {safeImageCount}/{MAX_IMAGES} photos and {safeAudioCount}/{MAX_AUDIO} recording.
            </p>
            <p className="mt-1 text-xs text-muted">Delete items to make room for new ones.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 sm:py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2 text-xs text-muted sm:text-sm">
            <Logo size="sm" showText={false} />
            <span>Komorebi</span>
          </div>
          <p className="text-xs text-muted sm:text-sm">
            Turn family stories into living memories
          </p>
        </div>
      </footer>
    </div>
  );
}
