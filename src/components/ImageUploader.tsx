"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { validateImageFile } from "@/lib/validate-file";

const MAX_IMAGES = 10;

interface ImageUploaderProps {
  capsuleId: string;
  imageCount: number;
}

export default function ImageUploader({
  capsuleId,
  imageCount,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const compressImage = (
    file: File
  ): Promise<{ blob: Blob; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Medium quality: max dimension 1600px preserves detail for most display sizes
        const maxSize = 1600;
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Use imageSmoothingQuality for better downscaling
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);
        }

        // 0.85 quality = medium-high, good balance of size vs quality
        canvas.toBlob(
          (blob) => {
            if (blob) resolve({ blob, width, height });
            else reject(new Error("Compression failed"));
          },
          "image/jpeg",
          0.85
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const remainingSlots = MAX_IMAGES - imageCount;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length < files.length) {
      setError(
        `Only ${remainingSlots} image slot${
          remainingSlots !== 1 ? "s" : ""
        } remaining. Some files were skipped.`
      );
    }

    if (filesToUpload.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];

        // Validate file type via magic bytes
        const validation = await validateImageFile(file);
        if (!validation.valid) {
          setError(validation.error || "Invalid file.");
          setUploading(false);
          return;
        }

        const { blob, width, height } = await compressImage(file);
        const fileName = `${user.id}/${capsuleId}/${Date.now()}-${i}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(fileName, blob);
        if (uploadError) throw uploadError;

        // Store the storage path (not a URL) — signed URLs are generated at display time
        const { error: insertError } = await supabase
          .from("media_items")
          .insert({
            capsule_id: capsuleId,
            type: "image",
            url: fileName,
            order_index: imageCount + i,
            width,
            height,
          });
        if (insertError) throw insertError;
      }

      router.refresh();
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  if (imageCount >= MAX_IMAGES) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <div className="mb-2 flex justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
        <p className="text-sm text-muted">Image album is full ({MAX_IMAGES}/{MAX_IMAGES})</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files) uploadFiles(e.target.files);
        }}
        disabled={uploading}
        className="absolute h-0 w-0 opacity-0"
        aria-hidden="true"
        tabIndex={-1}
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all sm:p-8 ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-surface"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <svg
              className="h-7 w-7 animate-spin text-primary sm:h-8 sm:w-8"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="text-sm text-muted">Adding to album...</p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary sm:h-12 sm:w-12">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[22px] sm:h-[22px]">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-foreground">
              Drop photos here or click to browse
            </p>
            <p className="mt-1 text-xs text-muted">
              Medium quality · {MAX_IMAGES - imageCount} of {MAX_IMAGES} slots left
            </p>
          </>
        )}
      </div>
    </div>
  );
}
