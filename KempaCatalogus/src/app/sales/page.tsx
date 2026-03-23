
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  CatalogGrid,
  type CatalogProduct,
} from "@/components/catalog/CatalogGrid";
import { FilterSidebar } from "@/components/catalog/FilterSidebar";
import { SalesShell } from "@/components/sales/SalesShell";

type SearchParams = {
  [key: string]: string | string[] | undefined;
  category?: string | string[];
  material?: string | string[];
  finish?: string | string[];
};

function normalizeParam(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

async function getSalesCatalogData(searchParams: SearchParams) {
  const supabase = await createSupabaseServerClient();

  const categorySlugs = normalizeParam(searchParams.category);
  const materialFilters = normalizeParam(searchParams.material);
  const finishFilters = normalizeParam(searchParams.finish);

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order", { ascending: true });

  let categoryIdsForFilter: string[] | undefined;
  if (categorySlugs.length > 0 && categories) {
    const map = new Map<string, string>();
    for (const cat of categories) {
      map.set(cat.slug, cat.id);
    }
    categoryIdsForFilter = categorySlugs
      .map((slug) => map.get(slug))
      .filter((id): id is string => Boolean(id));
  }

  let query = supabase
    .from("products")
    .select(
      "id, name, slug, description, material, finish, base_price, images, category_id, is_active",
    )
    .eq("is_active", true);

  if (categoryIdsForFilter && categoryIdsForFilter.length > 0) {
    query = query.in("category_id", categoryIdsForFilter);
  }

  if (materialFilters.length > 0) {
    query = query.in("material", materialFilters);
  }

  if (finishFilters.length > 0) {
    query = query.in("finish", finishFilters);
  }

  const { data: products } = await query;

  const catalogProducts: CatalogProduct[] =
    products?.map((p) => ({
      id: p.id as string,
      name: p.name as string,
      slug: p.slug as string,
      description: (p.description as string | null) ?? null,
      material: (p.material as string | null) ?? null,
      finish: (p.finish as string | null) ?? null,
      images: (p.images as string[] | null) ?? null,
      price: (p.base_price as number | null) ?? null,
      showPrice: (p.base_price as number | null) != null,
    })) ?? [];

  const materialsSet = new Set<string>();
  const finishesSet = new Set<string>();
  for (const p of catalogProducts) {
    if (p.material) materialsSet.add(p.material);
    if (p.finish) finishesSet.add(p.finish);
  }

  const availableMaterials = Array.from(materialsSet).sort((a, b) =>
    a.localeCompare(b),
  );
  const availableFinishes = Array.from(finishesSet).sort((a, b) =>
    a.localeCompare(b),
  );

  return {
    categories: categories ?? [],
    products: catalogProducts,
    selectedCategorySlugs: categorySlugs,
    selectedMaterials: materialFilters,
    selectedFinishes: finishFilters,
    availableMaterials,
    availableFinishes,
  };
}

type SalesCatalogPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function SalesCatalogPage(props: SalesCatalogPageProps) {
  const searchParams = await props.searchParams;
  const {
    categories,
    products,
    selectedCategorySlugs,
    selectedMaterials,
    selectedFinishes,
    availableMaterials,
    availableFinishes,
  } = await getSalesCatalogData(searchParams);

  return (
    <SalesShell
      title="Kempa salescatalogus"
      description="Interne catalogus voor het Kempa salesteam."
    >
      <div className="grid gap-6 md:grid-cols-[280px,1fr]">
        <FilterSidebar
          categories={categories ?? []}
          availableMaterials={availableMaterials}
          availableFinishes={availableFinishes}
          selectedCategorySlugs={selectedCategorySlugs}
          selectedMaterials={selectedMaterials}
          selectedFinishes={selectedFinishes}
        />

        <CatalogGrid products={products} baseHref="/sales" mode="sales" />
      </div>
    </SalesShell>
  );
}

