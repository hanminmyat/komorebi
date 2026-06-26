"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      // Map Supabase errors to user-friendly messages
      let friendlyMessage = "Something went wrong. Please try again.";
      if (error.message.includes("already registered")) {
        friendlyMessage = "An account with this email already exists. Try signing in instead.";
      } else if (error.message.includes("invalid email")) {
        friendlyMessage = "Please enter a valid email address.";
      }
      setErrors({ general: friendlyMessage });
      setLoading(false);
      return;
    }

    // If a session is returned, email confirmation is disabled — auto-login
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    // No session means confirmation email was sent
    setAwaitingConfirmation(true);
    setLoading(false);
  };

  if (awaitingConfirmation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-6 px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted">
            We sent a confirmation link to <strong className="text-foreground">{email}</strong>
          </p>
          <div className="rounded-xl border border-border bg-surface/50 p-4 text-sm text-muted">
            <p>Click the link in the email to verify your account. You&apos;ll be automatically signed in.</p>
          </div>
          <Link href="/login" className="inline-block font-medium text-foreground underline transition-colors hover:text-primary">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <Logo size="lg" href="/" />
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">Create account</h1>
          <p className="mt-2 text-muted">Start preserving family memories</p>
        </div>

        <form onSubmit={handleSignup} className="mt-8 space-y-4">
          {errors.general && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {errors.general}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={100}
              placeholder="John Doe"
              className={`mt-1 block w-full rounded-xl border px-3 py-2.5 shadow-sm focus:ring-2 focus:outline-none transition-colors ${
                errors.fullName
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-border bg-surface/50 focus:border-primary focus:ring-primary/20"
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={254}
              placeholder="john@example.com"
              className={`mt-1 block w-full rounded-xl border px-3 py-2.5 shadow-sm focus:ring-2 focus:outline-none transition-colors ${
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-border bg-surface/50 focus:border-primary focus:ring-primary/20"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={128}
              placeholder="At least 6 characters"
              className={`mt-1 block w-full rounded-xl border px-3 py-2.5 shadow-sm focus:ring-2 focus:outline-none transition-colors ${
                errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-border bg-surface/50 focus:border-primary focus:ring-primary/20"
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              maxLength={128}
              placeholder="Re-enter your password"
              className={`mt-1 block w-full rounded-xl border px-3 py-2.5 shadow-sm focus:ring-2 focus:outline-none transition-colors ${
                errors.confirmPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-border bg-surface/50 focus:border-primary focus:ring-primary/20"
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-2.5 font-medium text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline transition-colors hover:text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
