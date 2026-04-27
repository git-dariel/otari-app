import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CurrencyCode, InvestmentAsset, PortfolioItem } from '@/types/portfolio';

const STORAGE_KEY = 'investiq.portfolio.items.v1';

type CreatePortfolioItemInput = {
  asset: InvestmentAsset;
  amount: number;
  currency: CurrencyCode;
};

function createPortfolioId(): string {
  return `portfolio-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeAmount(value: number): number {
  return Number(value.toFixed(2));
}

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const serialized = await AsyncStorage.getItem(STORAGE_KEY);

  if (!serialized) {
    return [];
  }

  const parsed = JSON.parse(serialized) as PortfolioItem[];

  return parsed.sort((left, right) => {
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

export async function addPortfolioItem(input: CreatePortfolioItemInput): Promise<PortfolioItem[]> {
  const currentItems = await getPortfolioItems();

  const newItem: PortfolioItem = {
    id: createPortfolioId(),
    type: input.asset.type,
    assetId: input.asset.id,
    assetSymbol: input.asset.symbol,
    assetName: input.asset.name,
    iconUrl: input.asset.iconUrl,
    amount: normalizeAmount(input.amount),
    currency: input.currency,
    createdAt: new Date().toISOString(),
  };

  const nextItems = [newItem, ...currentItems];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));

  return nextItems;
}

type UpdatePortfolioItemInput = {
  id: string;
  asset: InvestmentAsset;
  amount: number;
  currency: CurrencyCode;
};

export async function updatePortfolioItem(
  input: UpdatePortfolioItemInput
): Promise<PortfolioItem[]> {
  const currentItems = await getPortfolioItems();
  const nextItems = currentItems.map((item) => {
    if (item.id !== input.id) {
      return item;
    }

    return {
      ...item,
      type: input.asset.type,
      assetId: input.asset.id,
      assetSymbol: input.asset.symbol,
      assetName: input.asset.name,
      iconUrl: input.asset.iconUrl,
      amount: normalizeAmount(input.amount),
      currency: input.currency,
    };
  });

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));

  return nextItems;
}

export async function deletePortfolioItem(id: string): Promise<PortfolioItem[]> {
  const currentItems = await getPortfolioItems();
  const nextItems = currentItems.filter((item) => item.id !== id);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));

  return nextItems;
}
