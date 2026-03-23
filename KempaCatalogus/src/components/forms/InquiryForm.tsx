'use client';

import { useState, type FormEvent } from "react";

type InquiryFormProps = {
  mode: "dealer" | "sales";
  products: { id: string; name: string }[];
  onSubmitted?: () => void;
  onCancel?: () => void;
};

export function InquiryForm({
  mode,
  products,
  onSubmitted,
  onCancel,
}: InquiryFormProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          productIds: products.map((p) => p.id),
          form: {
            name,
            company: company || undefined,
            email,
            message: message || undefined,
          },
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error || "Er ging iets mis bij het versturen.");
      }

      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Er ging iets mis bij het versturen.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--color-bg)] p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-[var(--color-text)]">
              Aanvraag sturen
            </h2>
            <p className="mt-1 text-xs text-[color-mix(in_srgb,var(--color-text)_65%,#9ca3af_35%)]">
              Voor{" "}
              {products.length === 1
                ? products[0].name
                : `${products.length} geselecteerde producten`}
              .
            </p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full px-2 py-1 text-xs text-[color-mix(in_srgb,var(--color-text)_70%,#9ca3af_30%)] hover:bg-[color-mix(in_srgb,var(--color-bg)_92%,#e5e7eb_8%)]"
            >
              Sluiten
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text)]">
              Naam*
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-[color-mix(in_srgb,var(--color-text)_10%,#e5e7eb_90%)] bg-white px-2.5 py-1.5 text-sm outline-none ring-0 focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text)]">
              Bedrijf
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="mt-1 w-full rounded-md border border-[color-mix(in_srgb,var(--color-text)_10%,#e5e7eb_90%)] bg-white px-2.5 py-1.5 text-sm outline-none ring-0 focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text)]">
              E-mail*
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-[color-mix(in_srgb,var(--color-text)_10%,#e5e7eb_90%)] bg-white px-2.5 py-1.5 text-sm outline-none ring-0 focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text)]">
              Bericht
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full rounded-md border border-[color-mix(in_srgb,var(--color-text)_10%,#e5e7eb_90%)] bg-white px-2.5 py-1.5 text-sm outline-none ring-0 focus:border-[var(--color-accent)]"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-emerald-600">
              Aanvraag succesvol verstuurd.
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-[color-mix(in_srgb,var(--color-text)_70%,#9ca3af_30%)] hover:bg-[color-mix(in_srgb,var(--color-bg)_92%,#e5e7eb_8%)]"
              >
                Annuleren
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-[color-mix(in_srgb,var(--color-accent)_85%,#111827_15%)] disabled:opacity-60"
            >
              {submitting ? "Versturen..." : "Aanvraag versturen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

