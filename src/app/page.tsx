import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Komorebi</h1>
        <p className="text-gray-600">Turn family stories into living memories</p>
        <div className="space-x-4 pt-4">
          <Link
            href="/login"
            className="rounded-md bg-black px-6 py-2.5 text-white hover:bg-gray-800"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-md border px-6 py-2.5 hover:bg-gray-50"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
