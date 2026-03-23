export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <main className="w-full max-w-4xl rounded-3xl bg-white p-8 shadow-sm md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Kempa Catalogus Portal
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
              Eén centraal portaal voor sales en dealers.
            </h1>
            <p className="text-sm leading-relaxed text-zinc-600">
              Log in als admin, dealer of sales om de catalogus te beheren,
              branded dealeromgevingen te bekijken of de interne salescatalogus
              te gebruiken.
            </p>
          </div>

          <div className="grid w-full max-w-xs gap-3 text-sm">
            <a
              href="/login"
              className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800"
            >
              Naar login
              <span className="text-xs text-zinc-200">Admin / Dealer / Sales</span>
            </a>
            <a
              href="/sales/login"
              className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50"
            >
              Salescatalogus
              <span className="text-xs text-zinc-500">Met gedeeld wachtwoord</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
