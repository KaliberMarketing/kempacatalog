"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorPageProps) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-zinc-900">
            Er ging iets mis
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Er is een fout opgetreden tijdens het laden van deze pagina.
          </p>
          <p className="mt-3 text-xs text-zinc-400">
            {error.message}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex items-center rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800"
          >
            Opnieuw proberen
          </button>
        </div>
      </body>
    </html>
  );
}

