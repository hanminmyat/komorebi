import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import DeleteCapsuleButton from "@/components/DeleteCapsuleButton";
import AudioRecorder from "@/components/AudioRecorder";
import ImageUploader from "@/components/ImageUploader";
import MediaItemActions from "@/components/MediaItemActions";

export default async function CapsuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: capsule } = await supabase
    .from("capsules")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!capsule) {
    notFound();
  }

  const { data: mediaItems } = await supabase
    .from("media_items")
    .select("*")
    .eq("capsule_id", capsule.id)
    .order("order_index");

  const canAddMedia = (mediaItems?.length || 0) < 10;
  const showAudioRecorder =
    canAddMedia && (capsule.type === "audio" || capsule.type === "mixed");
  const showImageUploader =
    canAddMedia && (capsule.type === "photo" || capsule.type === "mixed");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold">
            Komorebi
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-black"
              >
                ← Back
              </Link>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize">
                {capsule.type}
              </span>
            </div>
            <h1 className="text-2xl font-bold">{capsule.title}</h1>
            {capsule.description && (
              <p className="mt-1 text-gray-600">{capsule.description}</p>
            )}
            <p className="mt-2 text-sm text-gray-400">
              Created {new Date(capsule.created_at).toLocaleDateString()}
            </p>
          </div>
          <DeleteCapsuleButton capsuleId={capsule.id} />
        </div>

        {showAudioRecorder && (
          <div className="mb-6">
            <AudioRecorder
              capsuleId={capsule.id}
              currentMediaCount={mediaItems?.length || 0}
            />
          </div>
        )}

        {showImageUploader && (
          <div className="mb-6">
            <ImageUploader
              capsuleId={capsule.id}
              currentMediaCount={mediaItems?.length || 0}
            />
          </div>
        )}

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 font-semibold">
            Media ({mediaItems?.length || 0}/10)
          </h2>
          {mediaItems && mediaItems.length > 0 ? (
            <div className="space-y-3">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-md border p-3"
                >
                  <span className="text-2xl">
                    {item.type === "audio" ? "🎵" : "🖼️"}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize">{item.type}</p>
                    <p className="text-xs text-gray-400">
                      Position {item.order_index + 1}
                    </p>
                  </div>
                  {item.type === "audio" && (
                    <audio controls src={item.url} className="h-8" />
                  )}
                  {item.type === "image" && (
                    <img
                      src={item.url}
                      alt="Capsule media"
                      className="h-16 w-16 rounded object-cover"
                    />
                  )}
                  <MediaItemActions
                    itemId={item.id}
                    capsuleId={capsule.id}
                    mediaType={item.type}
                    storagePath={item.url.split("/").slice(-3).join("/")}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              No media added yet.{" "}
              {showAudioRecorder
                ? "Use the recorder above to add audio."
                : "Add media to this capsule."}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
