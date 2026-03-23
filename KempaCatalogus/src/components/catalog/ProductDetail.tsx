type ProductDetailProps = {
  name: string;
  description?: string | null;
  material?: string | null;
  finish?: string | null;
  images?: string[] | null;
  specs?: Record<string, string | number | null> | null;
  price?: number | null;
  showPrice?: boolean;
};

export function ProductDetail({
  name,
  description,
  material,
  finish,
  images,
  specs,
  price,
  showPrice = false,
}: ProductDetailProps) {
  const imageList = images ?? [];

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
      <div className="grid gap-8 md:grid-cols-[minmax(0,3fr),minmax(0,2fr)]">
        <div className="space-y-4">
          <div className="flex h-72 w-full items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 md:h-80">
            {imageList.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageList[0]}
                alt={name}
                className="max-h-full w-auto object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                Geen afbeelding beschikbaar
              </div>
            )}
          </div>

          {imageList.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imageList.slice(1).map((url, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url + index}
                  src={url}
                  alt={`${name} extra ${index + 1}`}
                  className="h-16 w-24 flex-none rounded-md border border-zinc-200 object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text,_#0f172a)]">
              {name}
            </h1>
            {(material || finish) && (
              <p className="mt-1 text-sm text-zinc-500">
                {[material, finish].filter(Boolean).join(" • ")}
              </p>
            )}
            {showPrice && price != null && (
              <p className="mt-2 text-xl font-bold text-[var(--color-accent,_#c8a96e)]">
                €{" "}
                {price.toLocaleString("nl-BE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>

          {description && (
            <div className="space-y-1.5">
              <h2 className="text-sm font-semibold text-zinc-900">
                Omschrijving
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600">
                {description}
              </p>
            </div>
          )}

          {specs && Object.keys(specs).length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-zinc-900">
                Technische specificaties
              </h2>
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <dl className="divide-y divide-zinc-100 text-sm">
                  {Object.entries(specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-[1.2fr,1.8fr] gap-3 px-4 py-2.5"
                    >
                      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        {key}
                      </dt>
                      <dd className="text-sm text-zinc-800">
                        {value ?? "–"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
