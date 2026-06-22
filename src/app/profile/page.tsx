import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo size="sm" href="/" />
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Your Profile
          </h1>
          <p className="mt-1 text-sm text-muted sm:text-base">
            Manage your account settings and personal information.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <ProfileForm
            user={user}
            profile={profile || { id: user.id, full_name: "", avatar_url: null }}
          />
        </div>
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
