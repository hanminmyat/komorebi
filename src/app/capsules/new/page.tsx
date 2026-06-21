import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateCapsuleForm from "@/components/CreateCapsuleForm";

export default async function NewCapsulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-surface/50 px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to capsules
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Create a Memory Capsule
          </h1>
          <p className="mt-2 text-sm text-muted">
            Preserve a family story, a moment, a voice — before it fades
          </p>
        </div>
        <CreateCapsuleForm />
      </main>
    </div>
  );
}
