import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import Logo from "@/components/Logo";
import MediaAlbum from "@/components/MediaAlbum";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

// Cached capsule lookup — shared between generateMetadata and page component
// to avoid duplicate Supabase queries on the same request.
const getCapsuleByToken = cache(async (token: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("capsules")
    .select("id, title, description, type, memory_date, created_at, is_public")
    .eq("share_token", token)
    .eq("is_public", true)
    .single();
  return data;
});

// Generate dynamic Open Graph metadata for rich link previews
export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { token } = await params;
  const capsule = await getCapsuleByToken(token);

  if (!capsule) {
    return { title: "Komorebi — Memory not found" };
  }

  const description =
    capsule.description || `A ${capsule.type} memory shared with love on Komorebi.`;

  return {
    title: `${capsule.title} — Komorebi`,
    description,
    openGraph: {
      title: capsule.title,
      description,
      type: "website",
      siteName: "Komorebi",
    },
    twitter: {
      card: "summary_large_image",
      title: capsule.title,
      description,
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const admin = createAdminClient();

  // Reuses the cached query from generateMetadata — single Supabase round-trip
  const capsule = await getCapsuleByToken(token);

  if (!capsule) {
    notFound();
  }

  // Fetch media items (RLS allows public read via share_token)
  const supabase = await createClient();
  const { data: mediaItems } = await supabase
    .from("media_items")
    .select("*")
    .eq("capsule_id", capsule.id)
    .order("order_index", { ascending: true });

  // Extract storage paths and group by bucket for batch signed URL generation
  const extractPath = (url: string): string => {
    if (url.includes("/storage/v1/object/")) {
      const match = url.match(
        /\/storage\/v1\/object\/(?:public|sign)\/(?:audio|images)\/(.+?)(?:\?|$)/
      );
      return match ? match[1] : url;
    }
    return url;
  };

  const imageItems = (mediaItems || []).filter((item) => item.type === "image");
  const audioItems = (mediaItems || []).filter((item) => item.type === "audio");

  // Batch signed URL generation: one API call per bucket instead of N calls
  const [imageUrls, audioUrls] = await Promise.all([
    imageItems.length > 0
      ? admin.storage
          .from("images")
          .createSignedUrls(imageItems.map((item) => extractPath(item.url)), 3600)
      : Promise.resolve({ data: [], error: null }),
    audioItems.length > 0
      ? admin.storage
          .from("audio")
          .createSignedUrls(audioItems.map((item) => extractPath(item.url)), 3600)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (imageUrls.error) {
    console.error("Failed to generate image signed URLs:", imageUrls.error);
  }
  if (audioUrls.error) {
    console.error("Failed to generate audio signed URLs:", audioUrls.error);
  }

  // Map signed URLs back to items
  const signedUrlMap = new Map<string, string>();
  (imageUrls.data || []).forEach((result) => {
    if (result.path && result.signedUrl) {
      signedUrlMap.set(result.path, result.signedUrl);
    }
  });
  (audioUrls.data || []).forEach((result) => {
    if (result.path && result.signedUrl) {
      signedUrlMap.set(result.path, result.signedUrl);
    }
  });

  const items = (mediaItems || []).map((item) => ({
    ...item,
    url: signedUrlMap.get(extractPath(item.url)) || "",
  }));
  const imageCount = items.filter((m: { type: string }) => m.type === "image").length;
  const audioCount = items.filter((m: { type: string }) => m.type === "audio").length;

  const displayDate = capsule.memory_date
    ? new Date(capsule.memory_date + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const typeLabel: Record<string, string> = {
    audio: "Audio Memory",
    photo: "Photo Memory",
    mixed: "Mixed Memory",
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Subtle warm gradient at top */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-80 bg-gradient-to-b from-primary/[0.04] via-primary/[0.02] to-transparent" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/60 bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo size="sm" href="/" />
          <div className="flex items-center gap-2 text-xs text-muted sm:text-sm">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Shared with love</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {/* Memory Header — The emotional center */}
        <div className="mb-10 text-center sm:mb-14">
          {/* Type badge */}
          <div className="mb-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs font-medium text-muted">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {typeLabel[capsule.type] || "Memory"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {capsule.title}
          </h1>

          {/* Description */}
          {capsule.description && (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {capsule.description}
            </p>
          )}

          {/* Meta info */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-muted sm:gap-4">
            {displayDate && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3 py-1.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {displayDate}
              </div>
            )}
            {(imageCount > 0 || audioCount > 0) && (
              <div className="inline-flex items-center gap-3 rounded-full bg-surface/80 px-3 py-1.5">
                {imageCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-leaf"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                    {imageCount} {imageCount === 1 ? "photo" : "photos"}
                  </span>
                )}
                {audioCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-sky"
                    >
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                    {audioCount} {audioCount === 1 ? "recording" : "recordings"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Decorative divider */}
        <div className="mb-8 flex items-center justify-center gap-3 sm:mb-10">
          <div className="h-px w-12 bg-border sm:w-16" />
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary/40"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <div className="h-px w-12 bg-border sm:w-16" />
        </div>

        {/* Media Album */}
        {items.length > 0 ? (
          <MediaAlbum items={items} capsuleId={capsule.id} readOnly />
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border/80 px-6 py-16 text-center sm:py-20">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-muted"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
            <p className="font-medium text-muted">This memory has no media yet</p>
            <p className="mt-1 text-sm text-muted">
              The storyteller may add photos and recordings soon
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/60 bg-surface/50 py-6 sm:py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 text-center sm:px-6">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span className="text-sm font-medium text-foreground">Komorebi</span>
          </div>
          <p className="text-xs text-muted">
            Turn family stories into living memories
          </p>
          <a
            href="/"
            className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-background hover:border-primary/30"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Create your own memory capsule
          </a>
        </div>
      </footer>
    </div>
  );
}
