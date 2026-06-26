"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import AudioPlayer from "./AudioPlayer";

export interface MediaItem {
  id: string;
  type: "audio" | "image";
  url: string;
  order_index: number;
}

interface MediaAlbumProps {
  items: MediaItem[];
  capsuleId: string;
  readOnly?: boolean;
}

const ROTATIONS = [
  "-rotate-1",
  "rotate-[0.8deg]",
  "-rotate-[0.5deg]",
  "rotate-[1.2deg]",
  "-rotate-[0.3deg]",
];

export default function MediaAlbum({
  items,
  capsuleId,
  readOnly = false,
}: MediaAlbumProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const supabase = createClient();
  const router = useRouter();

  // Generate signed URLs for all media items
  const generateSignedUrls = useCallback(async () => {
    const urlMap: Record<string, string> = {};
    for (const item of items) {
      const bucket = item.type === "audio" ? "audio" : "images";
      // If url already looks like a full URL (legacy data), extract the path
      let path = item.url;
      if (item.url.includes("/storage/v1/object/")) {
        const match = item.url.match(
          /\/storage\/v1\/object\/(?:public|sign)\/(?:audio|images)\/(.+?)(?:\?|$)/
        );
        path = match ? match[1] : item.url;
      }
      const { data } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 86400); // 24 hours
      if (data?.signedUrl) {
        urlMap[item.id] = data.signedUrl;
      }
    }
    setSignedUrls(urlMap);
  }, [items, supabase]);

  useEffect(() => {
    if (items.length > 0) {
      generateSignedUrls();
    }
  }, [items, generateSignedUrls]);

  const handleDelete = async (item: MediaItem) => {
    const message =
      item.type === "audio"
        ? "Remove this recording? You can only have 1 audio per capsule."
        : "Remove this photo from the album?";
    if (!confirm(message)) return;

    setDeleting(item.id);

    const bucket = item.type === "audio" ? "audio" : "images";
    // Use stored path directly (or extract from legacy URL)
    let path = item.url;
    if (item.url.includes("/storage/v1/object/")) {
      const match = item.url.match(
        /\/storage\/v1\/object\/(?:public|sign)\/(?:audio|images)\/(.+?)(?:\?|$)/
      );
      path = match ? match[1] : item.url;
    }
    await supabase.storage.from(bucket).remove([path]);

    // Delete media item — RLS verifies capsule ownership via subquery
    await supabase.from("media_items").delete().eq("id", item.id);
    setDeleting(null);
    router.refresh();
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface">
          <svg
            width="32"
            height="32"
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
        <p className="font-medium text-muted">This album is empty</p>
        <p className="mt-1 text-sm text-muted">
          Add your first photo or recording below
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
      {items.map((item, i) => {
        const rotation = ROTATIONS[i % ROTATIONS.length];
        const isDeleting = deleting === item.id;
        const displayUrl = signedUrls[item.id] || "";

        if (item.type === "image") {
          return (
            <div
              key={item.id}
              className={`group relative mb-5 break-inside-avoid ${rotation} transition-all duration-300 ${
                isDeleting ? "scale-95 opacity-30" : "opacity-100"
              }`}
            >
              {/* Polaroid frame */}
              <div className="relative overflow-hidden rounded-sm bg-white p-2.5 pb-8 shadow-md shadow-black/8 ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-black/12 dark:bg-[#F5F0E8] sm:p-3 sm:pb-10">
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayUrl}
                  alt="Capsule photo"
                  className="w-full rounded-[2px] object-cover"
                  loading="lazy"
                />

                {/* Subtle warm overlay for cohesion */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[2px] bg-gradient-to-b from-transparent via-transparent to-amber-900/[0.03]"
                />
              </div>

              {/* Decorative tape strip (top) */}
              <div aria-hidden="true" className="pointer-events-none absolute -top-1.5 left-1/2 -translate-x-1/2">
                <div className="h-4 w-10 rotate-1 rounded-[1px] bg-sunflower/30 shadow-sm backdrop-blur-[1px] sm:h-5 sm:w-12" />
              </div>

              {/* Delete button */}
              {!readOnly && (
                <button
                  onClick={() => handleDelete(item)}
                  disabled={isDeleting}
                  aria-label="Remove photo from album"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-muted opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                >
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
                    <line x1="18" x2="6" y1="6" y2="18" />
                    <line x1="6" x2="18" y1="6" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          );
        }

        // Audio item — styled as a warm note card
        return (
          <div
            key={item.id}
            className={`group relative mb-5 break-inside-avoid ${rotation} transition-all duration-300 ${
              isDeleting ? "scale-95 opacity-30" : "opacity-100"
            }`}
          >
            <div className="rounded-sm bg-surface p-5 shadow-md shadow-black/5 ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-lg hover:shadow-black/8 sm:p-6">
              {/* Header with icon */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Voice Recording
                  </p>
                  <p className="text-xs text-muted">
                    {readOnly ? "Shared memory" : "In this album"}
                  </p>
                </div>
              </div>

              {/* Custom audio player */}
              <AudioPlayer src={displayUrl} />
            </div>

            {/* Decorative pin */}
            <div aria-hidden="true" className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2">
              <div className="h-4 w-4 rounded-full bg-blossom/60 shadow-sm ring-2 ring-blossom/30" />
            </div>

            {/* Delete button */}
            {!readOnly && (
              <button
                onClick={() => handleDelete(item)}
                disabled={isDeleting}
                aria-label="Remove audio from album"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-muted opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              >
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
                  <line x1="18" x2="6" y1="6" y2="18" />
                  <line x1="6" x2="18" y1="6" y2="18" />
                </svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
