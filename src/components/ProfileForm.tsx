"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface ProfileFormProps {
  user: User;
  profile: Profile;
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [email] = useState(user.email || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName.trim(),
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="text-xl font-semibold">
            {fullName ? fullName.charAt(0).toUpperCase() : email?.charAt(0).toUpperCase() || "?"}
          </span>
        </div>
        <div>
          <p className="font-medium text-foreground">{fullName || "User"}</p>
          <p className="text-sm text-muted">{email}</p>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          className="mt-1 block w-full rounded-xl border border-border bg-background px-3 py-2.5 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
        />
      </div>

      {/* Email (read-only) */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          disabled
          className="mt-1 block w-full rounded-xl border border-border bg-surface/50 px-3 py-2.5 text-muted shadow-sm"
        />
        <p className="mt-1 text-xs text-muted">
          Email cannot be changed here. Contact support if you need to update your email.
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950/30 dark:text-green-400">
          Profile updated successfully!
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
