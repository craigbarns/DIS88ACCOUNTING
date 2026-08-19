import { Currency, ExchangeRates } from "../types";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  HKD: "HK$",
  EUR: "€",
  CNY: "¥",
  GBP: "£",
  SGD: "S$",
  JPY: "¥",
  CAD: "CA$",
  AUD: "A$",
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  USD: "US Dollar (USD)",
  HKD: "Hong Kong Dollar (HKD)",
  EUR: "Euro (EUR)",
  CNY: "Chinese Yuan / RMB (CNY)",
  GBP: "British Pound (GBP)",
  SGD: "Singapore Dollar (SGD)",
  JPY: "Japanese Yen (JPY)",
  CAD: "Canadian Dollar (CAD)",
  AUD: "Australian Dollar (AUD)",
};

export function formatCurrency(
  amount: number | undefined | null,
  currency: Currency = "USD",
  decimals: number = 2
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `0.00 ${CURRENCY_SYMBOLS[currency] || currency}`;
  }

  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  if (currency === "USD" || currency === "HKD" || currency === "GBP" || currency === "SGD" || currency === "CAD" || currency === "AUD") {
    return `${symbol}${formattedNumber}`;
  }
  return `${formattedNumber} ${symbol}`;
}

export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) return amount;
  if (!amount || isNaN(amount)) return 0;

  const fromRate = rates[fromCurrency] || 1.0;
  const toRate = rates[toCurrency] || 1.0;

  const amountInUSD = amount / fromRate;
  const targetAmount = amountInUSD * toRate;

  return Math.round(targetAmount * 100) / 100;
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "-";
  try {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  } catch {
    return dateString;
  }
}
