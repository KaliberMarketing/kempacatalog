import { pdf } from "@react-pdf/renderer";
import type { DealerBranding } from "@/components/branding/DealerShell";
import {
  TechnicalSheet,
  type TechnicalSheetProduct,
} from "@/components/pdf/TechnicalSheet";

export async function generateTechnicalSheetPdf(options: {
  product: TechnicalSheetProduct;
  branding?: DealerBranding | null;
  isSales?: boolean;
}) {
  const document = (
    <TechnicalSheet
      product={options.product}
      branding={options.branding}
      isSales={options.isSales}
    />
  );

  const instance = pdf(document);
  const buffer = await instance.toBuffer();
  return buffer;
}

