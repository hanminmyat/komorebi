"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export interface MediaItem {
  id: string;
  type: "audio" | "image";
  url: string;
  order_index: number;
}

interface MediaAlbumProps {
  items: MediaItem[];
  capsuleId: string;
}

const ROTATIONS = ["-rotate-1", "rotate-1", "-rotate-[0.5deg]", "rotate-[0.5deg]", "rotate-[1.5deg]"];

export default function MediaAlbum({ items, capsuleId }: MediaAlbumProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleDelete = async (item: MediaItem) => {
    if (!confirm("Remove this from the album?")) return;

    setDeleting(item.id);

    const bucket = item.type === "audio" ? "audio" : "images";
    const pathMatch = item.url.match(/\/storage\/v1\/object\/public\/(?:audio|images)\/(.+)$/);
    if (pathMatch) {
      await supabase.storage.from(bucket).remove([pathMatch[1]]);
    }

    await supabase.from("media_items").delete().eq("id", item.id);
    setDeleting(null);
    router.refresh();
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-border">
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
        <p className="text-muted font-medium">This album is empty</p>
        <p className="mt-1 text-sm text-muted">
          Add your first photo or recording below
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {items.map((item, i) => {
        const rotation = ROTATIONS[i % ROTATIONS.length];
        const isDeleting = deleting === item.id;

        if (item.type === "image") {
          return (
            <div
              key={item.id}
              className={`group relative mb-4 break-inside-avoid ${rotation} transition-all duration-300 ${
                isDeleting ? "opacity-30 scale-95" : "opacity-100"
              }`}
            >
              {/* Photo print frame */}
              <div className="overflow-hidden rounded-sm bg-white p-2 shadow-lg shadow-black/10 ring-1 ring-black/5 transition-shadow hover:shadow-xl hover:shadow-black/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt="Memory"
                  className="w-full rounded-sm object-cover"
                  loading="lazy"
                />
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(item)}
                disabled={isDeleting}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-muted opacity-0 shadow backdrop-blur-sm transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
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
            </div>
          );
        }

        // Audio item — styled as a note card
        return (
          <div
            key={item.id}
            className={`group relative mb-4 break-inside-avoid ${rotation} transition-all duration-300 ${
              isDeleting ? "opacity-30 scale-95" : "opacity-100"
            }`}
          >
            <div className="rounded-sm bg-accent/10 p-5 shadow-lg shadow-black/5 ring-1 ring-black/5 transition-shadow hover:shadow-xl hover:shadow-black/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-primary"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Voice Recording
                  </p>
                  <audio controls className="mt-2 w-full" src={item.url} />
                </div>
              </div>
            </div>

            {/* Delete button */}
            <button
              onClick={() => handleDelete(item)}
              disabled={isDeleting}
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-muted opacity-0 shadow backdrop-blur-sm transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
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
          </div>
        );
      })}
    </div>
  );
}
