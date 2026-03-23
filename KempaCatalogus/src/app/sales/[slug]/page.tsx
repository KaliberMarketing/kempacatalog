import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductDetail } from "@/components/catalog/ProductDetail";
import { SalesShell } from "@/components/sales/SalesShell";

type SalesProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SalesProductPage(props: SalesProductPageProps) {
  const params = await props.params;
  const supabase = await createSupabaseServerClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, material, finish, base_price, specs, images, is_active",
    )
    .eq("slug", params.slug)
    .maybeSingle();

  if (!product || product.is_active === false) {
    notFound();
  }

  const specs =
    (product.specs as Record<string, string | number | null> | null) ?? null;

  return (
    <SalesShell
      title="Productdetail"
      description="Bekijk de details van dit product."
    >
      <ProductDetail
        name={product.name as string}
        description={(product.description as string | null) ?? null}
        material={(product.material as string | null) ?? null}
        finish={(product.finish as string | null) ?? null}
        images={(product.images as string[] | null) ?? null}
        specs={specs}
        price={(product.base_price as number | null) ?? null}
        showPrice={(product.base_price as number | null) != null}
      />
    </SalesShell>
  );
}

