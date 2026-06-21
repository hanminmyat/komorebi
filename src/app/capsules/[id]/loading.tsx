export default function CapsuleDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-14 animate-pulse rounded-full bg-gray-200" />
            </div>
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="mb-6 rounded-lg border p-4">
          <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="rounded-lg border p-6">
          <div className="mb-4 h-6 w-24 animate-pulse rounded bg-gray-200" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-md border p-3">
                <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="mt-1 h-3 w-20 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
