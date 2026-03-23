import type { DealerBranding } from "@/components/branding/DealerShell";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

export type TechnicalSheetProduct = {
  name: string;
  description?: string | null;
  material?: string | null;
  finish?: string | null;
  specs?: Record<string, string | number | null> | null;
  imageUrl?: string | null;
  price?: number | null;
  showPrice?: boolean;
};

type TechnicalSheetProps = {
  product: TechnicalSheetProduct;
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  logoBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 64,
    height: 32,
    objectFit: "contain",
  },
  titleBox: {
    flexDirection: "column",
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  image: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
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
    fontSize: 14,
    fontWeight: 700,
    color: "#1a1a1a",
    marginTop: 8,
  },
});

export function TechnicalSheet({
  product,
  branding,
  isSales = false,
}: TechnicalSheetProps) {
  const title = product.name;
  const imageUrl = product.imageUrl ?? null;

  const headerTitle = branding
    ? branding.name
    : isSales
      ? "Kempa"
      : "Kempa Dealer";

  const subtitle = isSales
    ? "Technische fiche – salescatalogus"
    : "Technische fiche – dealer catalogus";

  const specsEntries = product.specs
    ? Object.entries(product.specs).filter(([_, value]) => value !== undefined)
    : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            {branding?.logoUrl ? (
              <Image style={styles.logo} src={branding.logoUrl} />
            ) : (
              <Text style={styles.title}>{headerTitle}</Text>
            )}
          </View>
          <View style={styles.titleBox}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        {imageUrl && <Image style={styles.image} src={imageUrl} />}

        {product.showPrice && product.price != null && (
          <View style={styles.section}>
            <Text style={styles.price}>
              € {product.price.toFixed(2).replace(".", ",")}
            </Text>
          </View>
        )}

        {(product.material || product.finish) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Materiaal &amp; afwerking</Text>
            <Text style={styles.text}>
              {[product.material, product.finish].filter(Boolean).join(" • ")}
            </Text>
          </View>
        )}

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
              {specsEntries.map(([key, value], index) => (
                <View
                  key={key}
                  style={[
                    styles.specRow,
                    index === specsEntries.length - 1
                      ? { borderBottomWidth: 0 }
                      : {},
                  ]}
                >
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specValue}>
                    {value !== null && value !== undefined ? String(value) : "–"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

