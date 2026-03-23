"use client";

import { useState, type FormEvent } from "react";

type BrandingEditorProps = {
  dealerId: string;
  initialBranding: {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontHeading: string;
    fontBody: string;
  };
};

const FONT_OPTIONS = [
  "Syne",
  "DM Sans",
  "Playfair Display",
  "Raleway",
  "Lato",
  "Nunito",
  "Josefin Sans",
  "Cormorant Garamond",
  "Barlow",
  "Outfit",
  "Fraunces",
  "Plus Jakarta Sans",
];

export function BrandingEditor({
  dealerId,
  initialBranding,
}: BrandingEditorProps) {
  const [form, setForm] = useState(initialBranding);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/dealers/${dealerId}/branding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error || "Kon branding niet opslaan.");
      }

      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kon branding niet opslaan.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,3fr),minmax(0,2fr)]">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">
          Branding instellingen
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700">
              Primaire kleur
            </label>
            <input
              type="color"
              value={form.primaryColor}
              onChange={(e) =>
                setForm((f) => ({ ...f, primaryColor: e.target.value }))
              }
              className="mt-1 h-9 w-full rounded-md border border-zinc-200 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700">
              Secundaire kleur
            </label>
            <input
              type="color"
              value={form.secondaryColor}
              onChange={(e) =>
                setForm((f) => ({ ...f, secondaryColor: e.target.value }))
              }
              className="mt-1 h-9 w-full rounded-md border border-zinc-200 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700">
              Accentkleur
            </label>
            <input
              type="color"
              value={form.accentColor}
              onChange={(e) =>
                setForm((f) => ({ ...f, accentColor: e.target.value }))
              }
              className="mt-1 h-9 w-full rounded-md border border-zinc-200 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700">
              Achtergrondkleur
            </label>
            <input
              type="color"
              value={form.backgroundColor}
              onChange={(e) =>
                setForm((f) => ({ ...f, backgroundColor: e.target.value }))
              }
              className="mt-1 h-9 w-full rounded-md border border-zinc-200 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700">
              Tekstkleur
            </label>
            <input
              type="color"
              value={form.textColor}
              onChange={(e) =>
                setForm((f) => ({ ...f, textColor: e.target.value }))
              }
              className="mt-1 h-9 w-full rounded-md border border-zinc-200 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700">
              Heading font
            </label>
            <select
              value={form.fontHeading}
              onChange={(e) =>
                setForm((f) => ({ ...f, fontHeading: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700">
              Body font
            </label>
            <select
              value={form.fontBody}
              onChange={(e) =>
                setForm((f) => ({ ...f, fontBody: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600">
            {error}
          </p>
        )}
        {saved && !error && (
          <p className="text-xs text-emerald-600">
            Branding opgeslagen.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 inline-flex items-center rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-60"
        >
          {saving ? "Opslaan..." : "Branding opslaan"}
        </button>
      </form>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">
          Live preview
        </h2>
        <div
          className="mt-3 rounded-xl border border-zinc-200 p-4"
          style={{
            backgroundColor: form.backgroundColor,
            color: form.textColor,
            fontFamily: `'${form.fontBody}', system-ui, sans-serif`,
          }}
        >
          <div className="mb-3 inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm">
            {initialBranding.name}
          </div>
          <h3
            className="text-lg font-semibold"
            style={{
              color: form.primaryColor,
              fontFamily: `'${form.fontHeading}', system-ui, sans-serif`,
            }}
          >
            Dealer catalogus
          </h3>
          <p className="mt-1 text-xs">
            Voorbeeld van titels, tekst en accentkleuren met de huidige
            brandinginstellingen.
          </p>
          <button
            type="button"
            className="mt-3 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-white"
            style={{ backgroundColor: form.accentColor }}
          >
            Voorbeeldknop
          </button>
        </div>
      </div>
    </div>
  );
}

