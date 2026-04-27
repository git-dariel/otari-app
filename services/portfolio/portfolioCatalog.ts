import type { InvestmentType } from '@/types/portfolio';

type InvestmentTypeOption = {
  id: InvestmentType;
  label: string;
  helperText: string;
};

export const INVESTMENT_TYPE_OPTIONS: InvestmentTypeOption[] = [
  {
    id: 'stock',
    label: 'Market Stocks',
    helperText: 'Public companies like Apple and Nvidia.',
  },
  {
    id: 'etf',
    label: 'ETFs',
    helperText: 'Funds that hold a basket of assets.',
  },
  {
    id: 'crypto',
    label: 'Crypto',
    helperText: 'High-volatility digital assets.',
  },
];

