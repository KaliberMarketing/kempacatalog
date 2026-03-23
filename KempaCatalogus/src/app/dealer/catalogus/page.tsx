import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DealerShell } from "@/components/branding/DealerShell";
import {
  CatalogGrid,
  type CatalogProduct,
} from "@/components/catalog/CatalogGrid";
import { FilterSidebar } from "@/components/catalog/FilterSidebar";

type SearchParams = {
  [key: string]: string | string[] | undefined;
  category?: string | string[];
  material?: string | string[];
  finish?: string | string[];
};

async function getBrandingForDealer() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dealerId =
    (user?.user_metadata as any | undefined)?.dealer_id ?? null;

  if (dealerId) {
    const { data } = await supabase
      .from("dealers")
      .select(
        "name, logo_url, primary_color, secondary_color, accent_color, background_color, text_color, font_heading, font_body",
      )
      .eq("id", dealerId)
      .maybeSingle();

    if (data) {
      return {
        name: data.name,
        logoUrl: data.logo_url as string | null,
        primaryColor: (data.primary_color as string | null) ?? "#1a1a1a",
        secondaryColor: (data.secondary_color as string | null) ?? "#ffffff",
        accentColor: (data.accent_color as string | null) ?? "#c8a96e",
        backgroundColor: (data.background_color as string | null) ?? "#f9f9f9",
        textColor: (data.text_color as string | null) ?? "#1a1a1a",
        fontHeading: (data.font_heading as string | null) ?? "Syne",
        fontBody: (data.font_body as string | null) ?? "DM Sans",
      };
    }
  }

  return {
    name: "Kempa",
    logoUrl: null,
    primaryColor: "#1a1a1a",
    secondaryColor: "#ffffff",
    accentColor: "#c8a96e",
    backgroundColor: "#f9f9f9",
    textColor: "#1a1a1a",
    fontHeading: "Syne",
    fontBody: "DM Sans",
  };
}

function normalizeParam(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

async function getCatalogData(searchParams: SearchParams) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dealerId =
    (user?.user_metadata as any | undefined)?.dealer_id ?? null;

  const categorySlugs = normalizeParam(searchParams.category);
  const materialFilters = normalizeParam(searchParams.material);
  const finishFilters = normalizeParam(searchParams.finish);

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order", { ascending: true });

  let allowedProductIds: string[] | undefined;
  const dealerPriceMap = new Map<
    string,
    { showPrice: boolean; price: number | null }
  >();

  if (dealerId) {
    const { data: dealerProducts } = await supabase
      .from("dealer_products")
      .select("product_id, show_price, price")
      .eq("dealer_id", dealerId);

    if (dealerProducts && dealerProducts.length > 0) {
      allowedProductIds = dealerProducts.map((row) => row.product_id as string);
      for (const dp of dealerProducts) {
        dealerPriceMap.set(dp.product_id as string, {
          showPrice: (dp.show_price as boolean) ?? false,
          price: (dp.price as number | null) ?? null,
        });
      }
    }
  }

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
      "id, name, slug, description, material, finish, images, category_id, is_active",
    )
    .eq("is_active", true);

  if (allowedProductIds) {
    query = query.in("id", allowedProductIds);
  }

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
    products?.map((p) => {
      const dp = dealerPriceMap.get(p.id as string);
      return {
        id: p.id as string,
        name: p.name as string,
        slug: p.slug as string,
        description: (p.description as string | null) ?? null,
        material: (p.material as string | null) ?? null,
        finish: (p.finish as string | null) ?? null,
        images: (p.images as string[] | null) ?? null,
        price: dp?.price ?? null,
        showPrice: dp?.showPrice ?? false,
      };
    }) ?? [];

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

type DealerCatalogPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function DealerCatalogPage(props: DealerCatalogPageProps) {
  const searchParams = await props.searchParams;
  const branding = await getBrandingForDealer();
  const {
    categories,
    products,
    selectedCategorySlugs,
    selectedMaterials,
    selectedFinishes,
    availableMaterials,
    availableFinishes,
  } = await getCatalogData(searchParams);

  return (
    <DealerShell branding={branding}>
      <div className="grid gap-6 md:grid-cols-[280px,1fr]">
        <FilterSidebar
          categories={categories ?? []}
          availableMaterials={availableMaterials}
          availableFinishes={availableFinishes}
          selectedCategorySlugs={selectedCategorySlugs}
          selectedMaterials={selectedMaterials}
          selectedFinishes={selectedFinishes}
        />

        <div className="space-y-4">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
            Catalogus
          </h1>
          <CatalogGrid
            products={products}
            baseHref="/dealer/catalogus"
            mode="dealer"
          />
        </div>
      </div>
    </DealerShell>
  );
}

