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
  const stream = await instance.toBuffer();
  const chunks: Uint8Array[] = [];

  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }

  return output;
}

