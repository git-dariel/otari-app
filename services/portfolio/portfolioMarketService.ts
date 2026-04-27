import type { InvestmentAsset, InvestmentType } from '@/types/portfolio';

type YahooQuote = {
  symbol: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
};

type YahooSearchResponse = {
  quotes?: YahooQuote[];
};

type CoinGeckoCoin = {
  id: string;
  symbol: string;
  name: string;
  large?: string;
  thumb?: string;
};

type CoinGeckoSearchResponse = {
  coins?: CoinGeckoCoin[];
};

function createAssetId(type: InvestmentType, symbol: string): string {
  return `${type}-${symbol.toLowerCase()}`;
}

function getStockOrEtfIcon(symbol: string): string {
  return `https://financialmodelingprep.com/image-stock/${symbol.toUpperCase()}.png`;
}

function normalizeYahooAsset(type: InvestmentType, quote: YahooQuote): InvestmentAsset {
  const symbol = quote.symbol.toUpperCase();
  const name = quote.longname ?? quote.shortname ?? symbol;

  return {
    id: createAssetId(type, symbol),
    type,
    symbol,
    name,
    iconUrl: getStockOrEtfIcon(symbol),
  };
}

function normalizeCryptoAsset(coin: CoinGeckoCoin): InvestmentAsset {
  const symbol = coin.symbol.toUpperCase();

  return {
    id: createAssetId('crypto', coin.id),
    type: 'crypto',
    symbol,
    name: coin.name,
    iconUrl: coin.large ?? coin.thumb ?? '',
  };
}

function getYahooQuoteTypeFilter(type: InvestmentType): string | null {
  if (type === 'stock') {
    return 'EQUITY';
  }

  if (type === 'etf') {
    return 'ETF';
  }

  return null;
}

export async function searchInvestmentAssets(
  type: InvestmentType,
  query: string
): Promise<InvestmentAsset[]> {
  const searchQuery = query.trim();

  if (searchQuery.length < 2) {
    return [];
  }

  if (type === 'crypto') {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(searchQuery)}`
    );

    if (!response.ok) {
      throw new Error('Failed to search crypto assets');
    }

    const payload = (await response.json()) as CoinGeckoSearchResponse;
    const coins = payload.coins ?? [];

    return coins.slice(0, 20).map(normalizeCryptoAsset).filter((asset) => Boolean(asset.iconUrl));
  }

  const response = await fetch(
    `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
      searchQuery
    )}&quotesCount=25&newsCount=0`
  );

  if (!response.ok) {
    throw new Error('Failed to search market assets');
  }

  const payload = (await response.json()) as YahooSearchResponse;
  const quoteTypeFilter = getYahooQuoteTypeFilter(type);
  const quotes = payload.quotes ?? [];

  return quotes
    .filter((quote) => {
      if (!quoteTypeFilter) {
        return true;
      }

      return quote.quoteType === quoteTypeFilter;
    })
    .slice(0, 20)
    .map((quote) => normalizeYahooAsset(type, quote));
}
