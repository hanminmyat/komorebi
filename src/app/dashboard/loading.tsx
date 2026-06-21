export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="h-6 w-24 animate-pulse rounded bg-foreground/10" />
          <div className="h-4 w-32 animate-pulse rounded bg-foreground/10" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {/* Welcome skeleton */}
        <div className="mb-6 sm:mb-8">
          <div className="h-8 w-64 animate-pulse rounded bg-foreground/10" />
          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-foreground/10" />
        </div>

        {/* Stats row skeleton */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:grid-cols-4 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-foreground/10" />
                <div>
                  <div className="h-6 w-8 animate-pulse rounded bg-foreground/10" />
                  <div className="mt-1 h-3 w-12 animate-pulse rounded bg-foreground/10" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section header skeleton */}
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <div>
            <div className="h-5 w-28 animate-pulse rounded bg-foreground/10" />
            <div className="mt-1 h-3 w-40 animate-pulse rounded bg-foreground/10" />
          </div>
          <div className="h-10 w-28 animate-pulse rounded-xl bg-foreground/10" />
        </div>

        {/* Cards grid skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border border-border p-4 sm:p-5">
              <div className="mb-2 flex items-start justify-between">
                <div className="h-5 w-32 animate-pulse rounded bg-foreground/10" />
                <div className="h-5 w-14 animate-pulse rounded-full bg-foreground/10" />
              </div>
              <div className="h-4 w-full animate-pulse rounded bg-foreground/10" />
              <div className="mt-3 flex items-center gap-2">
                <div className="h-3 w-3 animate-pulse rounded bg-foreground/10" />
                <div className="h-3 w-24 animate-pulse rounded bg-foreground/10" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
