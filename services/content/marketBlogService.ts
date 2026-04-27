import AsyncStorage from '@react-native-async-storage/async-storage';

import type { MarketBlogArticle, MarketBlogCategory } from '@/types/content';

const MARKET_BLOG_CACHE_KEY = 'investiq.market.blogs.v1';
const FETCH_TIMEOUT_MS = 9000;
const MAX_ARTICLES_PER_TAG = 6;
const MAX_TOTAL_ARTICLES = 18;

const MARKET_BLOG_TAGS: MarketBlogCategory[] = ['stocks', 'etf', 'crypto', 'investing'];

type DevToArticle = {
  id?: number;
  title?: string;
  description?: string;
  url?: string;
  published_at?: string;
  tag_list?: string[] | string;
  user?: {
    name?: string;
  };
};

type CachedMarketBlogArticles = {
  savedAt: string;
  articles: MarketBlogArticle[];
};

export type MarketBlogFetchResult = {
  articles: MarketBlogArticle[];
  fetchedAt: string | null;
  source: 'network' | 'cache' | 'empty';
};

function parseTagList(tagList: DevToArticle['tag_list']): string[] {
  if (Array.isArray(tagList)) {
    return tagList.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
  }

  if (typeof tagList === 'string') {
    return tagList
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
}

function sanitizeHttpsUrl(url: unknown): string | null {
  if (typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

function normalizeCategory(tags: string[], requestedTag: MarketBlogCategory): MarketBlogCategory {
  if (tags.includes('stocks') || tags.includes('stock-market') || tags.includes('stockmarket')) {
    return 'stocks';
  }

  if (tags.includes('etf') || tags.includes('etfs')) {
    return 'etf';
  }

  if (tags.includes('crypto') || tags.includes('cryptocurrency') || tags.includes('bitcoin')) {
    return 'crypto';
  }

  return requestedTag;
}

function normalizeDevToArticle(
  payload: DevToArticle,
  requestedTag: MarketBlogCategory
): MarketBlogArticle | null {
  const normalizedTitle = payload.title?.trim();
  const normalizedDescription = payload.description?.trim();
  const normalizedUrl = sanitizeHttpsUrl(payload.url);
  const normalizedPublishedAt = payload.published_at ? new Date(payload.published_at).toISOString() : null;
  const tags = parseTagList(payload.tag_list);

  if (!payload.id || !normalizedTitle || !normalizedDescription || !normalizedUrl || !normalizedPublishedAt) {
    return null;
  }

  return {
    id: `devto-${payload.id}`,
    title: normalizedTitle,
    description: normalizedDescription,
    url: normalizedUrl,
    authorName: payload.user?.name?.trim() || 'Unknown author',
    sourceName: 'DEV Community',
    category: normalizeCategory(tags, requestedTag),
    tags,
    publishedAt: normalizedPublishedAt,
  };
}

function sortByLatest(left: MarketBlogArticle, right: MarketBlogArticle): number {
  return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
}

function dedupeByUrl(articles: MarketBlogArticle[]): MarketBlogArticle[] {
  const seen = new Set<string>();
  const deduped: MarketBlogArticle[] = [];

  for (const article of articles) {
    if (seen.has(article.url)) {
      continue;
    }

    seen.add(article.url);
    deduped.push(article);
  }

  return deduped;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchDevToByTag(tag: MarketBlogCategory): Promise<MarketBlogArticle[]> {
  const response = await fetchWithTimeout(
    `https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&per_page=${MAX_ARTICLES_PER_TAG}`,
    FETCH_TIMEOUT_MS
  );

  if (!response.ok) {
    throw new Error('Unable to fetch market blogs.');
  }

  const payload = (await response.json()) as DevToArticle[];
  const articles = Array.isArray(payload) ? payload : [];

  return articles
    .map((item) => normalizeDevToArticle(item, tag))
    .filter((item): item is MarketBlogArticle => Boolean(item));
}

async function getCachedBlogs(): Promise<CachedMarketBlogArticles | null> {
  try {
    const raw = await AsyncStorage.getItem(MARKET_BLOG_CACHE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CachedMarketBlogArticles;

    if (!Array.isArray(parsed.articles) || typeof parsed.savedAt !== 'string') {
      return null;
    }

    return {
      savedAt: parsed.savedAt,
      articles: parsed.articles,
    };
  } catch {
    return null;
  }
}

async function setCachedBlogs(articles: MarketBlogArticle[]): Promise<void> {
  const payload: CachedMarketBlogArticles = {
    savedAt: new Date().toISOString(),
    articles,
  };

  await AsyncStorage.setItem(MARKET_BLOG_CACHE_KEY, JSON.stringify(payload));
}

export async function getMarketBlogArticles(): Promise<MarketBlogFetchResult> {
  try {
    const fetchedByTag = await Promise.all(MARKET_BLOG_TAGS.map((tag) => fetchDevToByTag(tag)));
    const merged = dedupeByUrl(fetchedByTag.flat())
      .sort(sortByLatest)
      .slice(0, MAX_TOTAL_ARTICLES);

    await setCachedBlogs(merged);

    return {
      articles: merged,
      fetchedAt: new Date().toISOString(),
      source: 'network',
    };
  } catch {
    const cached = await getCachedBlogs();

    if (cached?.articles.length) {
      return {
        articles: cached.articles.sort(sortByLatest),
        fetchedAt: cached.savedAt,
        source: 'cache',
      };
    }

    return {
      articles: [],
      fetchedAt: null,
      source: 'empty',
    };
  }
}
