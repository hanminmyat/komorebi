"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteCapsuleButton({
  capsuleId,
}: {
  capsuleId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm("Delete this capsule? This cannot be undone.")) {
      return;
    }

    setLoading(true);

    // Fetch media items to clean up storage files
    const { data: mediaItems } = await supabase
      .from("media_items")
      .select("url, type")
      .eq("capsule_id", capsuleId);

    // Delete storage files
    if (mediaItems && mediaItems.length > 0) {
      const audioPaths: string[] = [];
      const imagePaths: string[] = [];

      for (const item of mediaItems) {
        // Handle both legacy full URLs and direct storage paths
        let path = item.url;
        if (item.url.includes("/storage/v1/object/")) {
          const match = item.url.match(
            /\/storage\/v1\/object\/(?:public|sign)\/(?:audio|images)\/(.+?)(?:\?|$)/
          );
          path = match ? match[1] : item.url;
        }
        if (item.type === "audio") {
          audioPaths.push(path);
        } else {
          imagePaths.push(path);
        }
      }

      if (audioPaths.length > 0) {
        await supabase.storage.from("audio").remove(audioPaths);
      }
      if (imagePaths.length > 0) {
        await supabase.storage.from("images").remove(imagePaths);
      }
    }

    // Delete media_items records
    await supabase.from("media_items").delete().eq("capsule_id", capsuleId);

    // Delete the capsule itself
    await supabase.from("capsules").delete().eq("id", capsuleId);

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
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
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
