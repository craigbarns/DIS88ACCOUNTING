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

// ─── LIVE REAL-TIME EXCHANGE RATE FETCHER ────────────────────────────────────
export async function fetchLiveExchangeRates(): Promise<{
  rates: ExchangeRates;
  lastUpdated: string;
} | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) throw new Error("Failed to fetch rates from primary API");
    const data = await res.json();
    
    if (data && data.rates) {
      const liveRates: ExchangeRates = {
        USD: 1.0,
        HKD: Number((data.rates.HKD || 7.82).toFixed(4)),
        EUR: Number((data.rates.EUR || 0.92).toFixed(4)),
        CNY: Number((data.rates.CNY || 7.24).toFixed(4)),
        GBP: Number((data.rates.GBP || 0.79).toFixed(4)),
        SGD: Number((data.rates.SGD || 1.34).toFixed(4)),
        JPY: Number((data.rates.JPY || 155.0).toFixed(2)),
        CAD: Number((data.rates.CAD || 1.36).toFixed(4)),
        AUD: Number((data.rates.AUD || 1.52).toFixed(4)),
      };

      return {
        rates: liveRates,
        lastUpdated: data.time_last_update_utc || new Date().toUTCString(),
      };
    }
  } catch (err) {
    console.warn("Primary FX API failed, trying fallback...", err);
    try {
      const fallbackRes = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      if (!fallbackRes.ok) throw new Error("Fallback failed");
      const fallbackData = await fallbackRes.json();
      
      const liveRates: ExchangeRates = {
        USD: 1.0,
        HKD: Number((fallbackData.rates.HKD || 7.82).toFixed(4)),
        EUR: Number((fallbackData.rates.EUR || 0.92).toFixed(4)),
        CNY: Number((fallbackData.rates.CNY || 7.24).toFixed(4)),
        GBP: Number((fallbackData.rates.GBP || 0.79).toFixed(4)),
        SGD: Number((fallbackData.rates.SGD || 1.34).toFixed(4)),
        JPY: Number((fallbackData.rates.JPY || 155.0).toFixed(2)),
        CAD: Number((fallbackData.rates.CAD || 1.36).toFixed(4)),
        AUD: Number((fallbackData.rates.AUD || 1.52).toFixed(4)),
      };

      return {
        rates: liveRates,
        lastUpdated: fallbackData.date || new Date().toISOString(),
      };
    } catch (fallbackErr) {
      console.error("All FX APIs failed:", fallbackErr);
      return null;
    }
  }
  return null;
}
