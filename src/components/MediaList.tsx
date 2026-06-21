"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface MediaItem {
  id: string;
  type: "audio" | "image";
  url: string;
  order_index: number;
}

interface MediaListProps {
  items: MediaItem[];
  capsuleId: string;
}

export default function MediaList({ items, capsuleId }: MediaListProps) {
  const [orderedItems, setOrderedItems] = useState(items);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newItems = [...orderedItems];
    const [dragged] = newItems.splice(dragIndex, 1);
    newItems.splice(index, 0, dragged);
    setOrderedItems(newItems);
    setDragIndex(index);
  };

  const handleDragEnd = async () => {
    if (dragIndex === null) return;
    setDragIndex(null);

    const hasChanged = orderedItems.some(
      (item, index) => item.order_index !== index
    );

    if (!hasChanged) return;

    setSaving(true);

    const updates = orderedItems.map((item, index) => ({
      id: item.id,
      order_index: index,
    }));

    for (const update of updates) {
      await supabase
        .from("media_items")
        .update({ order_index: update.order_index })
        .eq("id", update.id);
    }

    setSaving(false);
    router.refresh();
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm("Delete this media item?")) return;

    const bucket = item.type === "audio" ? "audio" : "images";
    const path = item.url.split("/").slice(-3).join("/");

    await supabase.storage.from(bucket).remove([path]);
    await supabase.from("media_items").delete().eq("id", item.id);

    router.refresh();
  };

  if (orderedItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {saving && (
        <p className="text-xs text-gray-500">Saving order...</p>
      )}
      {orderedItems.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-3 rounded-md border p-3 cursor-grab active:cursor-grabbing ${
            dragIndex === index ? "opacity-50" : ""
          }`}
        >
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M4 16h16"
              />
            </svg>
          </div>
          <span className="text-sm text-gray-500 w-6">{index + 1}</span>
          <span className="text-2xl">
            {item.type === "audio" ? "🎵" : "🖼️"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium capitalize">{item.type}</p>
          </div>
          {item.type === "audio" && (
            <audio controls src={item.url} className="h-8 max-w-[200px]" />
          )}
          {item.type === "image" && (
            <img
              src={item.url}
              alt="Capsule media"
              className="h-12 w-12 rounded object-cover"
            />
          )}
          <button
            onClick={() => handleDelete(item)}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
