"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ConfirmDialog from "./ConfirmDialog";

export default function DeleteCapsuleButton({
  capsuleId,
}: {
  capsuleId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleDelete = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError(null);

    try {
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

        // Remove audio and image files in parallel
        await Promise.all([
          audioPaths.length > 0 && supabase.storage.from("audio").remove(audioPaths),
          imagePaths.length > 0 && supabase.storage.from("images").remove(imagePaths),
        ]);
      }

      // Delete media_items records
      await supabase.from("media_items").delete().eq("capsule_id", capsuleId);

      // Delete the capsule itself
      await supabase.from("capsules").delete().eq("id", capsuleId);

      window.location.href = "/dashboard";
    } catch {
      setError("Failed to delete. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <button
        onClick={() => setShowConfirm(true)}
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

      <ConfirmDialog
        open={showConfirm}
        title="Delete capsule?"
        description="This will permanently delete the capsule and all its photos and recordings. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
