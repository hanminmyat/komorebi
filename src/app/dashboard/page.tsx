import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import CapsuleCard from "@/components/CapsuleCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: capsules } = await supabase
    .from("capsules")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-surface/50 px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight"
          >
            Komorebi
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              My Memory Capsules
            </h1>
            <p className="mt-1 text-sm text-muted">
              {capsules?.length || 0} capsule{(capsules?.length || 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/capsules/new"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30"
          >
            New Capsule
          </Link>
        </div>

        {capsules && capsules.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {capsules.map((capsule) => (
              <CapsuleCard key={capsule.id} capsule={capsule} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border p-16 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
            </div>
            <p className="text-lg font-medium text-foreground">
              No memory capsules yet
            </p>
            <p className="mt-1 text-sm text-muted">
              Start preserving your family stories today
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
    </div>
  );
}
