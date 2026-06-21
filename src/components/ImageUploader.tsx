"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ImageUploaderProps {
  capsuleId: string;
  currentMediaCount: number;
}

export default function ImageUploader({
  capsuleId,
  currentMediaCount,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        const maxSize = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Compression failed"));
            }
          },
          "image/jpeg",
          0.8
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 10 - currentMediaCount;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length < files.length) {
      setError(`Only ${remainingSlots} slots remaining. Some files were skipped.`);
    }

    setUploading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const compressed = await compressImage(file);
        const fileName = `${user.id}/${capsuleId}/${Date.now()}-${i}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(fileName, compressed);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(fileName);

        const { error: insertError } = await supabase
          .from("media_items")
          .insert({
            capsule_id: capsuleId,
            type: "image",
            url: publicUrl,
            order_index: currentMediaCount + i,
          });

        if (insertError) throw insertError;
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-3 font-semibold">Upload Images</h3>

      {error && (
        <div className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Select Images"}
        </button>
        <p className="text-xs text-gray-500">
          Max 10 images per capsule. Images are compressed automatically.
        </p>
      </div>
    </div>
  );
}
