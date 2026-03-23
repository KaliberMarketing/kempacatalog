import type { DealerBranding } from "@/components/branding/DealerShell";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

export type CatalogPdfProduct = {
  name: string;
  description?: string | null;
  material?: string | null;
  finish?: string | null;
  specs?: Record<string, string | number | null> | null;
  imageUrl?: string | null;
  price?: number | null;
  showPrice?: boolean;
};

type CatalogPDFProps = {
  products: CatalogPdfProduct[];
  branding?: DealerBranding | null;
  isSales?: boolean;
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  coverHeader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  logo: {
    width: 80,
    height: 40,
    objectFit: "contain",
    marginBottom: 16,
  },
  coverTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 4,
  },
  coverSubtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 12,
  },
  coverMeta: {
    fontSize: 9,
    color: "#9ca3af",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerLogo: {
    width: 56,
    height: 28,
    objectFit: "contain",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: 700,
  },
  headerSubtitle: {
    fontSize: 9,
    color: "#6b7280",
  },
  image: {
    width: "100%",
    height: 200,
    objectFit: "cover",
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 4,
  },
  text: {
    fontSize: 10,
    color: "#4b5563",
    lineHeight: 1.4,
  },
  specsTable: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
  },
  specRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  specKey: {
    width: "40%",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#f9fafb",
    fontSize: 9,
    fontWeight: 600,
    color: "#6b7280",
  },
  specValue: {
    width: "60%",
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 10,
    color: "#111827",
  },
  price: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1a1a1a",
    marginTop: 4,
  },
});

export function CatalogPDF({
  products,
  branding,
  isSales = false,
}: CatalogPDFProps) {
  const headerTitle = branding
    ? branding.name
    : isSales
      ? "Kempa"
      : "Kempa Dealer";

  const coverSubtitle = isSales
    ? "Selectie uit de Kempa salescatalogus"
    : "Selectie uit de dealer catalogus";

  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${
    (today.getMonth() + 1).toString().padStart(2, "0")
  }/${today.getFullYear()}`;

  const safeProducts = products ?? [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.coverHeader}>
          {branding?.logoUrl ? (
            <Image style={styles.logo} src={branding.logoUrl} />
          ) : (
            <Text style={styles.coverTitle}>{headerTitle}</Text>
          )}
          <Text style={styles.coverSubtitle}>Productcatalogus selectie</Text>
          <Text style={styles.coverSubtitle}>{coverSubtitle}</Text>
          <Text style={styles.coverMeta}>
            Aantal producten: {safeProducts.length} • Datum: {formattedDate}
          </Text>
        </View>
      </Page>

      {safeProducts.map((product, index) => {
        const specsEntries = product.specs
          ? Object.entries(product.specs).filter(
              ([, value]) => value !== undefined,
            )
          : [];

        const materialFinish = [product.material, product.finish]
          .filter(Boolean)
          .join(" • ");

        return (
          <Page key={product.name + index} size="A4" style={styles.page}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {branding?.logoUrl ? (
                  <Image style={styles.headerLogo} src={branding.logoUrl} />
                ) : (
                  <Text style={styles.headerTitle}>{headerTitle}</Text>
                )}
              </View>
              <View>
                <Text style={styles.headerSubtitle}>
                  Product {index + 1} van {safeProducts.length}
                </Text>
              </View>
            </View>

            {product.imageUrl && (
              <Image style={styles.image} src={product.imageUrl} />
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{product.name}</Text>
              {materialFinish && (
                <Text style={styles.text}>{materialFinish}</Text>
              )}
              {product.showPrice && product.price != null && (
                <Text style={styles.price}>
                  € {product.price.toFixed(2).replace(".", ",")}
                </Text>
              )}
            </View>

            {product.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Omschrijving</Text>
                <Text style={styles.text}>{product.description}</Text>
              </View>
            )}

            {specsEntries.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Technische specificaties</Text>
                <View style={styles.specsTable}>
                  {specsEntries.map(([key, value], specIndex) => (
                    <View
                      key={key}
                      style={[
                        styles.specRow,
                        specIndex === specsEntries.length - 1
                          ? { borderBottomWidth: 0 }
                          : {},
                      ]}
                    >
                      <Text style={styles.specKey}>{key}</Text>
                      <Text style={styles.specValue}>
                        {value !== null && value !== undefined
                          ? String(value)
                          : "–"}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Page>
        );
      })}
    </Document>
  );
}

