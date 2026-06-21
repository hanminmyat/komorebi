import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import DeleteCapsuleButton from "@/components/DeleteCapsuleButton";
import AudioRecorder from "@/components/AudioRecorder";
import ImageUploader from "@/components/ImageUploader";
import MediaAlbum from "@/components/MediaAlbum";
import Logo from "@/components/Logo";

const MAX_IMAGES = 10;
const MAX_AUDIO = 1;

const typeColors: Record<string, string> = {
  audio: "bg-sky/15 text-sky",
  photo: "bg-leaf/15 text-leaf",
  mixed: "bg-blossom/15 text-blossom",
};

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

  const { data: capsule } = await supabase
    .from("capsules")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!capsule) {
    notFound();
  }

  const { data: mediaItems } = await supabase
    .from("media_items")
    .select("*")
    .eq("capsule_id", capsule.id)
    .order("order_index");

  // Separate counts by type
  const allItems = mediaItems || [];
  const imageCount = allItems.filter((item) => item.type === "image").length;
  const audioCount = allItems.filter((item) => item.type === "audio").length;
  const mediaCount = allItems.length;

  const canAddImage = imageCount < MAX_IMAGES;
  const canAddAudio = audioCount < MAX_AUDIO;

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
            <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {/* Album Cover Card */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg shadow-black/5 sm:mb-10">
          <div className="p-5 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
              <div className="flex-1">
                {/* Memory date */}
                {displayDate ? (
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted sm:mb-4 sm:text-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    {displayDate}
                  </div>
                ) : (
                  <div className="mb-3 inline-flex items-center gap-2 text-xs text-muted sm:mb-4 sm:text-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    Date unknown
                  </div>
                )}

                <h1 className="text-xl font-bold leading-tight text-foreground sm:text-2xl lg:text-3xl">
                  {capsule.title}
                </h1>

                {capsule.description && (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:mt-3">
                    {capsule.description}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4 sm:gap-3">
                  <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium capitalize ${
                    typeColors[capsule.type] || "bg-surface text-muted"
                  }`}>
                    {capsule.type}
                  </span>
                  <span className="text-xs text-muted">Created {createdDate}</span>
                  <span className="text-xs text-muted">
                    {imageCount} photo{imageCount !== 1 ? "s" : ""} · {audioCount} recording{audioCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="self-start">
                <DeleteCapsuleButton capsuleId={capsule.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Album Spread */}
        <section className="mb-8 sm:mb-10">
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <h2 className="text-base font-semibold text-foreground sm:text-lg">Album</h2>
            <div className="flex items-center gap-3 text-xs text-muted sm:gap-4 sm:text-sm">
              <span>📷 {imageCount}/{MAX_IMAGES}</span>
              <span>🎙 {audioCount}/{MAX_AUDIO}</span>
            </div>
          </div>

          <MediaAlbum items={allItems} capsuleId={capsule.id} />
        </section>

        {/* Add to Album */}
        {(showImageUploader || showAudioRecorder) && (
          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6 lg:p-8">
            <h2 className="mb-4 text-base font-semibold text-foreground sm:mb-6 sm:text-lg">Add to this album</h2>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              {showImageUploader && (
                <div>
                  <ImageUploader capsuleId={capsule.id} imageCount={imageCount} />
                </div>
              )}
              {showAudioRecorder && (
                <div>
                  <AudioRecorder capsuleId={capsule.id} audioCount={audioCount} />
                </div>
              )}
            </div>
          </section>
        )}

        {!showImageUploader && !showAudioRecorder && mediaCount > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-4 text-center sm:p-6">
            <p className="text-sm text-muted">
              Album is full — {imageCount}/{MAX_IMAGES} photos and {audioCount}/{MAX_AUDIO} recording.
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
