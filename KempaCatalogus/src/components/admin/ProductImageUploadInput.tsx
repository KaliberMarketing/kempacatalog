"use client";

import { useState, type ChangeEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ProductImageUploadInputProps = {
  /**
   * Het id van de textarea waarin we de URL's moeten bijschrijven.
   * Moet overeenkomen met het id-atribuut van de textarea (standaard: image_urls).
   */
  targetTextareaId?: string;
};

export function ProductImageUploadInput({
  targetTextareaId = "image_urls",
}: ProductImageUploadInputProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const extension = file.name.split(".").pop() || "jpg";
      const filePath = `products/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${extension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError || !uploadData) {
        console.error("Supabase image upload error (client):", uploadError);
        setError("Upload mislukt. Probeer het opnieuw.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(uploadData.path);

      const textarea = document.getElementById(
        targetTextareaId,
      ) as HTMLTextAreaElement | null;

      if (textarea) {
        const current = textarea.value.trim();
        textarea.value = current ? `${current}\n${publicUrl}` : publicUrl;
      }
    } catch (err) {
      console.error("Unexpected image upload error (client):", err);
      setError("Er ging iets mis bij het uploaden.");
    } finally {
      setUploading(false);
      // input resetten zodat dezelfde file opnieuw gekozen kan worden
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-zinc-800">
        Afbeelding uploaden
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-50"
      />
      <p className="text-xs text-zinc-500">
        Upload een afbeelding; de URL wordt automatisch toegevoegd in het veld
        hieronder.
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

