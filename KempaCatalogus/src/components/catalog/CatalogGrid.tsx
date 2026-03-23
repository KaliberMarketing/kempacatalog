"use client";

import { useCallback, useMemo, useState } from "react";
import { ProductCard, type CatalogProduct } from "./ProductCard";
export type { CatalogProduct } from "./ProductCard";
import { SelectionBar } from "./SelectionBar";
import { InquiryForm } from "../forms/InquiryForm";

type CatalogGridProps = {
  products: CatalogProduct[];
  baseHref: string;
  mode: "dealer" | "sales";
};

export function CatalogGrid({ products, baseHref, mode }: CatalogGridProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showInquiry, setShowInquiry] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [columns, setColumns] = useState<2 | 3 | 4>(3);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((existing) => existing !== id)
        : [...current, id],
    );
  }, []);

  const handleExportPdf = useCallback(() => {
    if (selectedIds.length === 0) return;
    const params = new URLSearchParams();
    params.set("productIds", selectedIds.join(","));
    params.set("mode", mode);
    const url = `/api/pdf/catalog?${params.toString()}`;
    window.open(url, "_blank");
  }, [mode, selectedIds]);

  const handleRequestInquiry = useCallback(() => {
    if (selectedIds.length === 0) return;
    setShowInquiry(true);
  }, [selectedIds.length]);

  const selectedProductsForInquiry = useMemo(
    () =>
      products
        .filter((p) => selectedIds.includes(p.id))
        .map((p) => ({ id: p.id, name: p.name })),
    [products, selectedIds],
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => {
      const haystack = [
        product.name,
        product.description ?? "",
        product.material ?? "",
        product.finish ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [products, searchQuery]);

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
        Geen producten gevonden voor de gekozen filters.
      </div>
    );
  }

  const gridColsClass =
    columns === 2
      ? "sm:grid-cols-2 lg:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Zoek op naam, materiaal of afwerking..."
              className="h-9 w-full rounded-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
            />
          </div>

          <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 text-xs text-zinc-600 shadow-sm">
            <span className="hidden pl-2 pr-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400 sm:inline">
              Weergave
            </span>
            <button
              type="button"
              onClick={() => setColumns(2)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                columns === 2
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              2 per rij
            </button>
            <button
              type="button"
              onClick={() => setColumns(3)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                columns === 3
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              3 per rij
            </button>
            <button
              type="button"
              onClick={() => setColumns(4)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                columns === 4
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              4 per rij
            </button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
            Geen producten gevonden voor de gekozen filters of zoekterm.
          </div>
        ) : (
          <>
            <div className={`grid gap-4 ${gridColsClass}`}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  href={`${baseHref}/${product.slug}`}
                  selectable
                  selected={selectedIds.includes(product.id)}
                  onToggleSelect={() => toggleSelect(product.id)}
                />
              ))}
            </div>

            <SelectionBar
              selectedCount={selectedIds.length}
              onExportPdf={handleExportPdf}
              onRequestInquiry={handleRequestInquiry}
            />
          </>
        )}
      </div>

      {showInquiry && selectedProductsForInquiry.length > 0 && (
        <InquiryForm
          mode={mode}
          products={selectedProductsForInquiry}
          onSubmitted={() => setShowInquiry(false)}
          onCancel={() => setShowInquiry(false)}
        />
      )}
    </>
  );
}

