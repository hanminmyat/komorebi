import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
        <Logo size="sm" href="/" />
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground sm:px-4 sm:text-sm"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-hover sm:px-4 sm:text-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 md:pt-32">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted sm:mb-6 sm:px-4 sm:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
            Preserve what matters most
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-6xl">
            Turn family stories into{" "}
            <span className="text-primary">living memories</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted sm:mt-6 sm:text-lg md:text-xl">
            Komorebi helps you capture the stories behind photos, the voices
            behind traditions, and the meaning behind moments — before they
            fade away.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 sm:w-auto sm:px-8 sm:py-3.5 sm:text-base"
            >
              Start preserving memories
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
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-surface sm:w-auto sm:px-8 sm:py-3.5 sm:text-base"
            >
              Sign in to your capsules
            </Link>
          </div>
        </div>

        {/* Decorative visual */}
        <div className="relative mx-auto mt-12 max-w-2xl sm:mt-20">
          <div className="rounded-2xl border border-border bg-surface p-1 shadow-2xl shadow-primary/5">
            <div className="rounded-xl bg-background p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:h-12 sm:w-12">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-primary sm:w-6 sm:h-6"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    <path d="M12 6v6l4 2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground sm:text-base">
                    Summer at Grandma&apos;s House
                  </p>
                  <p className="mt-1 text-xs text-muted sm:text-sm">
                    Audio recording · Created 2 days ago
                  </p>
                  <div className="mt-2 flex gap-2 sm:mt-3">
                    <span className="rounded-md bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                      Audio
                    </span>
                    <span className="rounded-md bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                      Family
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute -bottom-4 left-1/2 h-24 w-3/4 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"></div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border bg-surface/50 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Memories in three simple steps
            </h2>
            <p className="mt-3 text-base text-muted sm:mt-4 sm:text-lg">
              No complicated setup. Just press record and start talking.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:mt-16 sm:gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="group relative rounded-2xl border border-border bg-background p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                1. Record the story
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                Capture grandma&apos;s voice telling the story behind that old
                photograph. The emotion, the laughter, the pauses — they all
                matter.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group relative rounded-2xl border border-border bg-background p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary group-hover:text-white">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                2. Add the photos
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                Attach the photos, letters, or objects that hold meaning. Each
                image becomes part of a bigger story — not just another file in
                a folder.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group relative rounded-2xl border border-border bg-background p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <svg
                  width="24"
                  height="24"
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
              <h3 className="mb-2 text-lg font-semibold">
                3. Keep it alive
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                Your memory capsule is preserved — structured, meaningful, and
                ready to be rediscovered by the next generation. Stories that
                don&apos;t get lost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capsule Types */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Every memory is unique
            </h2>
            <p className="mt-3 text-base text-muted sm:mt-4 sm:text-lg">
              Choose the format that fits the story you want to preserve.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:mt-16 sm:gap-6 md:grid-cols-3">
            {/* Audio Capsule */}
            <div className="group rounded-2xl border border-border bg-surface p-8 transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-primary"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Audio Capsule</h3>
              <p className="text-sm leading-relaxed text-muted">
                Record the voices, the stories, the laughter. A grandparent
                retelling their childhood, a parent sharing wisdom — preserved
                exactly as it was spoken.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                <span>Best for storytelling</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </div>
            </div>

            {/* Photo Capsule */}
            <div className="group rounded-2xl border border-border bg-surface p-8 transition-all hover:border-secondary/30 hover:shadow-xl hover:shadow-secondary/5">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-secondary"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Photo Capsule</h3>
              <p className="text-sm leading-relaxed text-muted">
                Gather the photos that tell a story together. Old family
                portraits, vacation snapshots, handwritten letters — organized
                with meaning, not just dates.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-secondary">
                <span>Best for visual memories</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </div>
            </div>

            {/* Mixed Capsule */}
            <div className="group rounded-2xl border border-border bg-surface p-8 transition-all hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-primary"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Mixed Capsule</h3>
              <p className="text-sm leading-relaxed text-muted">
                The richest memories combine everything — a voice recording with
                photos of the place, letters alongside the stories they
                inspired. All in one capsule.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                <span>Best for complete stories</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emotional CTA */}
      <section className="border-t border-border bg-surface/50 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 sm:mb-8 sm:h-16 sm:w-16">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-primary sm:w-8 sm:h-8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </div>
          <blockquote className="text-xl font-medium leading-relaxed text-foreground sm:text-2xl md:text-3xl">
            &ldquo;Families rarely lose photos. They lose the stories behind
            them.&rdquo;
          </blockquote>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted sm:mt-6 sm:text-lg">
            Every family has stories worth keeping. The question isn&apos;t
            whether to preserve them — it&apos;s whether to start today or wish
            you had.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 sm:mt-10 sm:w-auto sm:px-10 sm:py-4 sm:text-lg"
          >
            Create your first memory capsule
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 sm:py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between sm:gap-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-muted sm:text-sm">
            <Logo size="sm" href="/" showText={false} />
            <span>Komorebi</span>
            <span className="text-border">·</span>
            <span className="hidden sm:inline">Turn family stories into living memories</span>
          </div>
          <p className="text-xs text-muted sm:text-sm">
            &copy; {new Date().getFullYear()} Komorebi. Made with care.
          </p>
        </div>
      </footer>
    </div>
  );
}
