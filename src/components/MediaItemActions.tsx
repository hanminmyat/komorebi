"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface MediaItemActionsProps {
  itemId: string;
  capsuleId: string;
  storagePath: string;
}

export default function MediaItemActions({
  itemId,
  storagePath,
}: MediaItemActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm("Delete this media item?")) return;

    setLoading(true);

    await supabase.storage.from("audio").remove([storagePath]);
    await supabase.from("media_items").delete().eq("id", itemId);

    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}
