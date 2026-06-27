import { createClient } from "@/lib/supabase/server";
import MediaAlbum from "./MediaAlbum";

interface CapsuleMediaAlbumProps {
  capsuleId: string;
  userId: string;
}

const SIGNED_URL_EXPIRY = 14400; // 4 hours — owned capsules get a longer window

/**
 * Server component that fetches media items and generates signed URLs.
 * Wrapped in Suspense by the parent page to enable streaming.
 *
 * Security: requires userId and verifies capsule ownership via RLS.
 */
export default async function CapsuleMediaAlbum({ capsuleId, userId }: CapsuleMediaAlbumProps) {
  const supabase = await createClient();

  // Verify capsule ownership before accessing media
  const { data: capsule } = await supabase
    .from("capsules")
    .select("id")
    .eq("id", capsuleId)
    .eq("user_id", userId)
    .single();

  if (!capsule) {
    return null;
  }

  // Fetch media items — RLS enforces ownership
  const { data: mediaItems } = await supabase
    .from("media_items")
    .select("*")
    .eq("capsule_id", capsuleId)
    .order("order_index");

  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
        <p className="font-medium text-muted">This album is empty</p>
        <p className="mt-1 text-sm text-muted">Add your first photo or recording below</p>
      </div>
    );
  }

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

  const imageItems = mediaItems.filter((item) => item.type === "image");
  const audioItems = mediaItems.filter((item) => item.type === "audio");

  // Batch signed URL generation: one API call per bucket instead of N calls
  const [imageUrls, audioUrls] = await Promise.all([
    imageItems.length > 0
      ? supabase.storage
          .from("images")
          .createSignedUrls(imageItems.map((item) => extractPath(item.url)), SIGNED_URL_EXPIRY)
      : Promise.resolve({ data: [], error: null }),
    audioItems.length > 0
      ? supabase.storage
          .from("audio")
          .createSignedUrls(audioItems.map((item) => extractPath(item.url)), SIGNED_URL_EXPIRY)
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

  const allItems = mediaItems.map((item) => ({
    ...item,
    url: signedUrlMap.get(extractPath(item.url)) || "",
  }));

  return <MediaAlbum items={allItems} capsuleId={capsuleId} />;
}
