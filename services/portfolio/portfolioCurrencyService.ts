import type { CurrencyCode, PortfolioItem } from "@/types/portfolio";

const EXCHANGE_RATE_TIMEOUT_MS = 6000;
const FALLBACK_USD_TO_PHP_RATE = 56;

type ExchangeRateHostResponse = {
  success?: boolean;
  rates?: {
    PHP?: number;
  };
};

export type ExchangeRateResult = {
  rate: number;
  isFallback: boolean;
};

function isValidRate(rate: unknown): rate is number {
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getUsdToPhpExchangeRate(): Promise<ExchangeRateResult> {
  try {
    const response = await fetchWithTimeout(
      "https://api.exchangerate.host/latest?base=USD&symbols=PHP",
      EXCHANGE_RATE_TIMEOUT_MS,
    );

    if (!response.ok) {
      return { rate: FALLBACK_USD_TO_PHP_RATE, isFallback: true };
    }

    const payload = (await response.json()) as ExchangeRateHostResponse;
    const rate = payload.rates?.PHP;

    if (!payload.success || !isValidRate(rate)) {
      return { rate: FALLBACK_USD_TO_PHP_RATE, isFallback: true };
    }

    return { rate, isFallback: false };
  } catch {
    return { rate: FALLBACK_USD_TO_PHP_RATE, isFallback: true };
  }
}

export function getFallbackUsdToPhpRate(): number {
  return FALLBACK_USD_TO_PHP_RATE;
}

export function convertToPhp(amount: number, currency: CurrencyCode, usdToPhpRate: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  if (currency === "USD") {
    return amount * usdToPhpRate;
  }

  return amount;
}

export function getPortfolioTotalInPhp(items: PortfolioItem[], usdToPhpRate: number): number {
  return items.reduce((total, item) => total + convertToPhp(item.amount, item.currency, usdToPhpRate), 0);
}
