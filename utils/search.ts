type Searchable = {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
};

export function filterByQuery<T extends Searchable>(items: T[], query: string): T[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => {
    const haystack = [
      item.title,
      item.description,
      item.category,
      ...(item.tags ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}
