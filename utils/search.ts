type Searchable = {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  bodyMarkdown?: string;
  keyTakeaways?: string[];
  riskNotes?: string[];
};

const stopWords = new Set([
  'a',
  'about',
  'an',
  'and',
  'ano',
  'ba',
  'is',
  'it',
  'ng',
  'si',
  'the',
  'what',
  'why',
]);

const synonymMap: Record<string, string[]> = {
  etf: ['exchange', 'traded', 'fund', 'basket'],
  market: ['investing', 'investment', 'asset', 'assets'],
  stocks: ['stock', 'company', 'companies', 'asset', 'assets'],
  stock: ['stocks', 'company', 'companies', 'asset', 'assets'],
};

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeQuery(query: string): string[] {
  const tokens = normalizeSearchText(query)
    .split(' ')
    .filter((token) => token.length > 1 && !stopWords.has(token));

  return Array.from(
    new Set(tokens.flatMap((token) => [token, ...(synonymMap[token] ?? [])])),
  );
}

export function filterByQuery<T extends Searchable>(items: T[], query: string): T[] {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return items;
  }

  const queryTokens = tokenizeQuery(query);

  return items
    .map((item) => {
      const haystack = [
        item.title,
        item.description,
        item.category,
        ...(item.tags ?? []),
        item.bodyMarkdown,
        ...(item.keyTakeaways ?? []),
        ...(item.riskNotes ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const normalizedHaystack = normalizeSearchText(haystack);
      const score =
        (normalizedHaystack.includes(normalizedQuery) ? 5 : 0) +
        queryTokens.reduce(
          (total, token) => total + (normalizedHaystack.includes(token) ? 1 : 0),
          0,
        );

      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ item }) => item);
}
