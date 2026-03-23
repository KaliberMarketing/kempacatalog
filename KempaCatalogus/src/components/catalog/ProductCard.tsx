import Link from "next/link";
import type { MouseEvent } from "react";

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  material?: string | null;
  finish?: string | null;
  images?: string[] | null;
  price?: number | null;
  showPrice?: boolean;
};

type ProductCardProps = {
  product: CatalogProduct;
  href: string;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
};

export function ProductCard({
  product,
  href,
  selectable = false,
  selected = false,
  onToggleSelect,
}: ProductCardProps) {
  const imageUrl = product.images?.[0] ?? null;

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleSelect?.();
  };

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_6%,var(--color-secondary)_94%)] bg-[color-mix(in_srgb,var(--color-secondary)_96%,#ffffff_4%)] shadow-sm transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-accent)_55%,var(--color-text)_15%,#e5e7eb_30%)] hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-[color-mix(in_srgb,var(--color-bg)_70%,#e5e7eb_30%)]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
            Geen afbeelding
          </div>
        )}

        {selectable && (
          <button
            type="button"
            onClick={handleToggle}
            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-white/95 text-xs font-medium text-[color-mix(in_srgb,var(--color-text)_85%,#4b5563_15%)] shadow-sm transition hover:bg-[color-mix(in_srgb,var(--color-accent)_12%,#f9fafb_88%)]"
          >
            {selected ? "✓" : "+"}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-4 py-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-[var(--color-text)]">
          {product.name}
        </h3>
        {(product.material || product.finish) && (
          <p className="text-xs text-[color-mix(in_srgb,var(--color-text)_60%,#9ca3af_40%)]">
            {[product.material, product.finish].filter(Boolean).join(" • ")}
          </p>
        )}
        {product.showPrice && product.price != null && (
          <p className="text-sm font-semibold text-[var(--color-accent)]">
            €{" "}
            {product.price.toLocaleString("nl-BE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        )}
        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs text-[color-mix(in_srgb,var(--color-text)_60%,#9ca3af_40%)]">
            {product.description}
          </p>
        )}
      </div>
    </Link>
  );
}

