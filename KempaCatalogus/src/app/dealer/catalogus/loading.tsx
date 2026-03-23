"use client";

export default function DealerCatalogLoading() {
  return (
    <div className="flex min-h-screen justify-center bg-zinc-50">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
        <header className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded-full bg-zinc-200" />
          <div className="h-3 w-56 animate-pulse rounded-full bg-zinc-200" />
        </header>

        <div className="grid gap-6 md:grid-cols-[280px,1fr]">
          <aside className="space-y-3">
            <div className="h-4 w-28 animate-pulse rounded-full bg-zinc-200" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-3 w-full animate-pulse rounded-full bg-zinc-200"
                />
              ))}
            </div>
          </aside>

          <section className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm"
                >
                  <div className="aspect-[4/3] animate-pulse bg-zinc-100" />
                  <div className="space-y-2 px-4 py-3">
                    <div className="h-3 w-3/4 animate-pulse rounded-full bg-zinc-200" />
                    <div className="h-3 w-1/2 animate-pulse rounded-full bg-zinc-200" />
                    <div className="h-3 w-full animate-pulse rounded-full bg-zinc-200" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

