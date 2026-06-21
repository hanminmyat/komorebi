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
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Komorebi
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Capsules</h1>
          <Link
            href="/capsules/new"
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
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
          <div className="rounded-lg border-2 border-dashed p-12 text-center">
            <p className="text-gray-600">No capsules yet</p>
            <Link
              href="/capsules/new"
              className="mt-2 inline-block font-medium underline"
            >
              Create your first capsule
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
