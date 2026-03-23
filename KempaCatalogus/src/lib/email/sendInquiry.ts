import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fallbackKempaEmail =
  process.env.KEMPA_INQUIRY_EMAIL ?? "info@kempa.be";

if (!resendApiKey) {
  // In development we don't throw, but we will no-op sending and log instead.
  console.warn(
    "[sendInquiry] RESEND_API_KEY is not set. Inquiry emails will not be sent.",
  );
}

export type InquirySource = "dealer" | "sales";

export type InquiryProductSummary = {
  id: string;
  name: string;
  slug: string;
};

export type InquiryFormData = {
  name: string;
  company?: string;
  email: string;
  message?: string;
};

type SendInquiryOptions = {
  source: InquirySource;
  dealerName?: string | null;
  dealerInquiryEmail?: string | null;
  products: InquiryProductSummary[];
  form: InquiryFormData;
};

export async function sendInquiryEmail(options: SendInquiryOptions) {
  const to =
    options.dealerInquiryEmail && options.dealerInquiryEmail.length > 0
      ? options.dealerInquiryEmail
      : fallbackKempaEmail;

  const subjectPrefix =
    options.source === "dealer" ? "[Dealer aanvraag]" : "[Sales aanvraag]";

  const subject = `${subjectPrefix} ${
    options.products.length === 1
      ? options.products[0].name
      : `${options.products.length} producten`
  }`;

  const productLines = options.products
    .map(
      (p, index) =>
        `${index + 1}. ${p.name} (slug: ${p.slug}, id: ${p.id})`,
    )
    .join("\n");

  const dealerLine =
    options.source === "dealer"
      ? `Dealer: ${options.dealerName ?? "Onbekende dealer"}\n`
      : "";

  const body = [
    dealerLine,
    `Naam aanvrager: ${options.form.name}`,
    `Bedrijf: ${options.form.company || "–"}`,
    `E-mail: ${options.form.email}`,
    "",
    "Bericht:",
    options.form.message || "–",
    "",
    "Geselecteerde producten:",
    productLines,
  ].join("\n");

  if (!resendApiKey) {
    console.log("[sendInquiry] Would send email:", {
      to,
      subject,
      body,
    });
    return;
  }

  const resend = new Resend(resendApiKey);

  await resend.emails.send({
    from: "Kempa Catalogus <no-reply@kempacatalogus.be>",
    to,
    subject,
    text: body,
  });
}

