import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <a href="/dashboard" className="text-xl font-bold">
            Komorebi
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Create New Capsule</h1>
        <CreateCapsuleForm />
      </main>
    </div>
  );
}
