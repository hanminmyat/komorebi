export default function CapsuleDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-4 w-12 animate-pulse rounded bg-foreground/10" />
            <div className="h-4 w-px bg-border" />
            <div className="h-6 w-24 animate-pulse rounded bg-foreground/10" />
          </div>
          <div className="h-4 w-32 animate-pulse rounded bg-foreground/10" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {/* Album cover card skeleton */}
        <div className="mb-8 rounded-2xl border border-border p-5 sm:mb-10 sm:p-8 lg:p-10">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-16 animate-pulse rounded bg-foreground/10" />
            <div className="h-5 w-14 animate-pulse rounded-full bg-foreground/10" />
          </div>
          <div className="h-8 w-48 animate-pulse rounded bg-foreground/10" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-foreground/10" />
          <div className="mt-3 flex items-center gap-3">
            <div className="h-5 w-14 animate-pulse rounded-full bg-foreground/10" />
            <div className="h-3 w-28 animate-pulse rounded bg-foreground/10" />
            <div className="h-3 w-32 animate-pulse rounded bg-foreground/10" />
          </div>
        </div>

        {/* Album section skeleton */}
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <div className="h-5 w-16 animate-pulse rounded bg-foreground/10" />
          <div className="h-4 w-24 animate-pulse rounded bg-foreground/10" />
        </div>

        {/* Media items skeleton */}
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4 break-inside-avoid rounded-xl border border-border p-4">
              <div className="h-32 animate-pulse rounded-lg bg-foreground/10" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
