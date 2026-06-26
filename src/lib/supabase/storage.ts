/**
 * Extract the storage path from a Supabase storage URL.
 * Handles both public URLs and signed URLs.
 *
 * Example input:
 *   "https://xxx.supabase.co/storage/v1/object/public/images/abc/def/123.jpg"
 *   "https://xxx.supabase.co/storage/v1/object/sign/images/abc/def/123.jpg?token=..."
 * Output: "abc/def/123.jpg"
 */
export function getStoragePath(url: string, bucket: "audio" | "images"): string | null {
  // Match the path after the bucket name in the URL
  const match = url.match(
    new RegExp(`/storage/v1/object/(?:public|sign)\\/${bucket}\\/(.+?)(?:\\?|$)`)
  );
  return match ? match[1] : null;
}

/**
 * Extract the bucket name from a Supabase storage URL.
 */
export function getBucket(url: string): "audio" | "images" | null {
  if (url.includes("/audio/")) return "audio";
  if (url.includes("/images/")) return "images";
  return null;
}
