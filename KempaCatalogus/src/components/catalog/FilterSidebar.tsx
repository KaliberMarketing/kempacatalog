type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type FilterSidebarProps = {
  categories: CategoryOption[];
  availableMaterials: string[];
  availableFinishes: string[];
  selectedCategorySlugs: string[];
  selectedMaterials: string[];
  selectedFinishes: string[];
};

export function FilterSidebar({
  categories = [],
  availableMaterials = [],
  availableFinishes = [],
  selectedCategorySlugs = [],
  selectedMaterials = [],
  selectedFinishes = [],
}: FilterSidebarProps) {
  return (
    <aside className="w-full max-w-xs space-y-6 rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_6%,var(--color-secondary)_94%)] bg-[color-mix(in_srgb,var(--color-secondary)_96%,#ffffff_4%)] p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-[var(--color-text)]">Filters</h2>

      <form className="space-y-5" method="get">
        {categories.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[color-mix(in_srgb,var(--color-text)_65%,#9ca3af_35%)]">
              Categorie
            </p>
            <div className="space-y-1.5">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 text-xs text-[color-mix(in_srgb,var(--color-text)_80%,#4b5563_20%)]"
                >
                  <input
                    type="checkbox"
                    name="category"
                    value={category.slug}
                    defaultChecked={selectedCategorySlugs.includes(
                      category.slug,
                    )}
                    className="h-3.5 w-3.5 rounded border-[color-mix(in_srgb,var(--color-text)_12%,#d4d4d8_88%)] text-[var(--color-text)] focus:ring-[var(--color-accent)]"
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {availableMaterials.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[color-mix(in_srgb,var(--color-text)_65%,#9ca3af_35%)]">
              Materiaal
            </p>
            <div className="space-y-1.5">
              {availableMaterials.map((material) => (
                <label
                  key={material}
                  className="flex items-center gap-2 text-xs text-[color-mix(in_srgb,var(--color-text)_80%,#4b5563_20%)]"
                >
                  <input
                    type="checkbox"
                    name="material"
                    value={material}
                    defaultChecked={selectedMaterials.includes(material)}
                    className="h-3.5 w-3.5 rounded border-[color-mix(in_srgb,var(--color-text)_12%,#d4d4d8_88%)] text-[var(--color-text)] focus:ring-[var(--color-accent)]"
                  />
                  <span>{material}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {availableFinishes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[color-mix(in_srgb,var(--color-text)_65%,#9ca3af_35%)]">
              Afwerking
            </p>
            <div className="space-y-1.5">
              {availableFinishes.map((finish) => (
                <label
                  key={finish}
                  className="flex items-center gap-2 text-xs text-[color-mix(in_srgb,var(--color-text)_80%,#4b5563_20%)]"
                >
                  <input
                    type="checkbox"
                    name="finish"
                    value={finish}
                    defaultChecked={selectedFinishes.includes(finish)}
                    className="h-3.5 w-3.5 rounded border-[color-mix(in_srgb,var(--color-text)_12%,#d4d4d8_88%)] text-[var(--color-text)] focus:ring-[var(--color-accent)]"
                  />
                  <span>{finish}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 rounded-full bg-[var(--color-primary)] px-3 py-2 text-xs font-medium text-white transition hover:bg-black/80"
          >
            Filters toepassen
          </button>
          <a
            href="."
            className="rounded-full border border-[color-mix(in_srgb,var(--color-text)_10%,#e5e7eb_90%)] px-3 py-2 text-xs font-medium text-[color-mix(in_srgb,var(--color-text)_70%,#9ca3af_30%)] hover:bg-[color-mix(in_srgb,var(--color-bg)_92%,#f3f4f6_8%)]"
          >
            Wissen
          </a>
        </div>
      </form>
    </aside>
  );
}

