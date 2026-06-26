import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import CapsuleCard from "@/components/CapsuleCard";
import Logo from "@/components/Logo";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Run profile + capsule queries in parallel (no dependency between them)
  const [{ data: profile }, { data: capsules }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase.from("capsules").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  // Fetch media counts for user's capsules only
  const allCapsules = capsules || [];
  const capsuleIds = allCapsules.map((c) => c.id);
  const { data: mediaItems } =
    capsuleIds.length > 0
      ? await supabase
          .from("media_items")
          .select("type, capsule_id")
          .in("capsule_id", capsuleIds)
      : { data: [] as { type: string; capsule_id: string }[] | null };

  const allMedia = mediaItems || [];
  const totalPhotos = allMedia.filter((m) => m.type === "image").length;
  const totalRecordings = allMedia.filter((m) => m.type === "audio").length;

  // Type breakdown
  const audioCapsules = allCapsules.filter((c) => c.type === "audio").length;
  const photoCapsules = allCapsules.filter((c) => c.type === "photo").length;
  const mixedCapsules = allCapsules.filter((c) => c.type === "mixed").length;

  const firstName = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo size="sm" href="/" />
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted hover:text-foreground hover:bg-surface transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-xs font-semibold">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:inline">
                {profile?.full_name || user.email}
              </span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted sm:text-base">
            Your family stories, preserved and waiting to be rediscovered.
          </p>
        </div>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border border-border bg-surface p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 sm:h-9 sm:w-9">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary sm:h-[18px] sm:w-[18px]"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground sm:text-2xl">
                  {allCapsules.length}
                </p>
                <p className="text-xs text-muted">Capsules</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky/10 sm:h-9 sm:w-9">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-sky sm:h-[18px] sm:w-[18px]"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground sm:text-2xl">
                  {totalPhotos}
                </p>
                <p className="text-xs text-muted">Photos</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 sm:h-9 sm:w-9">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent sm:h-[18px] sm:w-[18px]"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground sm:text-2xl">
                  {totalRecordings}
                </p>
                <p className="text-xs text-muted">Recordings</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blossom/10 sm:h-9 sm:w-9">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blossom sm:h-[18px] sm:w-[18px]"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground sm:text-2xl">
                  {allCapsules.length > 0
                    ? Math.round(
                        ((totalPhotos + totalRecordings) /
                          allCapsules.length) *
                          100
                      )
                    : 0}
                  %
                </p>
                <p className="text-xs text-muted">With Media</p>
              </div>
            </div>
          </div>
        </div>

        {/* Capsules Section */}
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Your Capsules
            </h2>
            {allCapsules.length > 0 && (
              <p className="mt-0.5 text-xs text-muted sm:text-sm">
                {audioCapsules > 0 &&
                  `${audioCapsules} audio`}
                {audioCapsules > 0 && photoCapsules > 0 && " · "}
                {photoCapsules > 0 &&
                  `${photoCapsules} photo`}
                {photoCapsules > 0 && mixedCapsules > 0 && " · "}
                {mixedCapsules > 0 &&
                  `${mixedCapsules} mixed`}
              </p>
            )}
          </div>
          <Link
            href="/capsules/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" x2="8" y1="3" y2="13" />
              <line x1="3" x2="13" y1="8" y2="8" />
            </svg>
            New Capsule
          </Link>
        </div>

        {allCapsules.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allCapsules.map((capsule) => (
              <CapsuleCard key={capsule.id} capsule={capsule} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border px-6 py-12 text-center sm:py-16">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <svg
                width="40"
                height="40"
                viewBox="0 0 28 28"
                fill="none"
                className="text-primary"
              >
                <circle
                  cx="14"
                  cy="14"
                  r="12"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M14 6C14 6 8 12 8 16C8 19.3 10.7 22 14 22C17.3 22 20 19.3 20 16C20 12 14 6 14 6Z"
                  fill="currentColor"
                  opacity="0.3"
                />
                <path
                  d="M14 8C14 8 10 13 10 16C10 18.2 11.8 20 14 20C16.2 20 18 18.2 18 16C18 13 14 8 14 8Z"
                  fill="currentColor"
                  opacity="0.6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No memory capsules yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Start preserving your family stories. Record a voice, gather
              photos, and create something that lasts.
            </p>
            <Link
              href="/capsules/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-lg"
            >
              Create Your First Capsule
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 sm:py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2 text-xs text-muted sm:text-sm">
            <Logo size="sm" showText={false} />
            <span>Komorebi</span>
          </div>
          <p className="text-xs text-muted sm:text-sm">
            Turn family stories into living memories
          </p>
        </div>
      </footer>
    </div>
  );
}
