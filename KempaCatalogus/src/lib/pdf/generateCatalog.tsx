import { pdf } from "@react-pdf/renderer";
import type { DealerBranding } from "@/components/branding/DealerShell";
import {
  CatalogPDF,
  type CatalogPdfProduct,
} from "@/components/pdf/CatalogPDF";

export async function generateCatalogPdf(options: {
  products: CatalogPdfProduct[];
  branding?: DealerBranding | null;
  isSales?: boolean;
}) {
  const document = (
    <CatalogPDF
      products={options.products}
      branding={options.branding}
      isSales={options.isSales}
    />
  );

  const instance = pdf(document);
  const buffer = await instance.toBuffer();
  return buffer;
}

