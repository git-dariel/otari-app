export type InvestmentType = 'stock' | 'etf' | 'crypto';

export type CurrencyCode = 'PHP' | 'USD';

export type InvestmentAsset = {
  id: string;
  type: InvestmentType;
  symbol: string;
  name: string;
  iconUrl: string;
};

export type PortfolioItem = {
  id: string;
  type: InvestmentType;
  assetId: string;
  assetSymbol: string;
  assetName: string;
  iconUrl: string;
  amount: number;
  currency: CurrencyCode;
  createdAt: string;
};
