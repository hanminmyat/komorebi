import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import DeleteCapsuleButton from "@/components/DeleteCapsuleButton";
import AudioRecorder from "@/components/AudioRecorder";
import ImageUploader from "@/components/ImageUploader";
import MediaList from "@/components/MediaList";

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
          <p className="mb-3 text-xs text-gray-500">
            Drag to reorder items
          </p>
          {mediaItems && mediaItems.length > 0 ? (
            <MediaList items={mediaItems} capsuleId={capsule.id} />
          ) : (
            <p className="text-sm text-gray-600">
              No media added yet.{" "}
              {showAudioRecorder
                ? "Use the recorder above to add audio."
                : showImageUploader
                  ? "Use the uploader above to add images."
                  : "Add media to this capsule."}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
