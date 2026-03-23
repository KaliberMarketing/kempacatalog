"use client";

import { useState, type ChangeEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type DealerLogoUploadInputProps = {
  /**
   * Het id van het inputveld waarin we de logo-URL moeten zetten.
   * Moet overeenkomen met het id-attribuut van het tekstveld (standaard: logo_url).
   */
  targetInputId?: string;
};

export function DealerLogoUploadInput({
  targetInputId = "logo_url",
}: DealerLogoUploadInputProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const extension = file.name.split(".").pop() || "png";
      const filePath = `dealer-logos/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${extension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError || !uploadData) {
        console.error("Supabase dealer logo upload error:", uploadError);
        setError("Upload mislukt. Probeer het opnieuw.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(uploadData.path);

      const input = document.getElementById(
        targetInputId,
      ) as HTMLInputElement | null;

      if (input) {
        input.value = publicUrl;
      }
    } catch (err) {
      console.error("Unexpected dealer logo upload error:", err);
      setError("Er ging iets mis bij het uploaden.");
    } finally {
      setUploading(false);
      // input resetten zodat dezelfde file opnieuw gekozen kan worden
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-700">
        Logo uploaden
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-50"
      />
      <p className="text-[11px] text-zinc-500">
        Upload hier het dealerlogo. De openbare URL wordt automatisch ingevuld
        in het veld "Logo URL".
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

