import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const LOCALE_BY_CURRENCY: Record<string, string> = {
  EUR: "nl-BE",
  USD: "en-US",
  GBP: "en-GB",
};

export function formatCurrency(value: number, currency = "EUR"): string {
  const locale = LOCALE_BY_CURRENCY[currency] ?? "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("nl-BE").format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function calcCPA(spend: number, conversions: number): number | null {
  if (conversions === 0) return null;
  return spend / conversions;
}

export function calcROAS(revenue: number | null, spend: number): number | null {
  if (!revenue || spend === 0) return null;
  return revenue / spend;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
