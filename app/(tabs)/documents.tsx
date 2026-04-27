import { FileText } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { Screen } from '@/components/common/Screen';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { SearchBox } from '@/components/common/SearchBox';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/StateViews';
import { getMarketBlogArticles } from '@/services/content/marketBlogService';
import type { MarketBlogArticle } from '@/types/content';
import { filterByQuery } from '@/utils/search';
import { formatDate } from '@/utils/format';

export default function DocumentsScreen() {
  const [query, setQuery] = useState('');
  const [marketBlogs, setMarketBlogs] = useState<MarketBlogArticle[]>([]);
  const [isBlogLoading, setIsBlogLoading] = useState(true);
  const [blogError, setBlogError] = useState<string | null>(null);
  const [blogSource, setBlogSource] = useState<'network' | 'cache' | 'empty'>('empty');
  const [blogFetchedAt, setBlogFetchedAt] = useState<string | null>(null);
  const filteredMarketBlogs = useMemo(() => filterByQuery(marketBlogs, query), [marketBlogs, query]);

  useEffect(() => {
    let isMounted = true;

    async function loadMarketBlogs() {
      setIsBlogLoading(true);
      setBlogError(null);

      const result = await getMarketBlogArticles();

      if (!isMounted) {
        return;
      }

      setMarketBlogs(result.articles);
      setBlogSource(result.source);
      setBlogFetchedAt(result.fetchedAt);
      setIsBlogLoading(false);

      if (result.source === 'empty') {
        setBlogError('Unable to load market blogs right now. Check your connection and try again.');
      } else if (result.source === 'cache') {
        setBlogError('Showing saved blogs from this device while offline.');
      }
    }

    loadMarketBlogs();

    return () => {
      isMounted = false;
    };
  }, []);

  async function openBlogUrl(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      setBlogError('Unable to open this blog link right now.');
    }
  }

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Market reads"
        title="Blogs"
        subtitle="Fresh open-source blogs for beginner investing education."
      />
      <View className="mb-1">
        <SearchBox
          value={query}
          placeholder="Search market blogs"
          onChangeText={setQuery}
          className="mb-1 min-h-12 px-4"
        />
      </View>

      <View className="mt-3">
        <Text className="text-[11px] font-black uppercase tracking-widest text-forest-700">
          Open-source market blogs
        </Text>
        <Text className="mt-1 text-sm leading-5 text-slate-600">
          Fresh educational reads about market stocks, ETFs, crypto, and long-term investing.
        </Text>
        <Text className="mt-1 text-xs text-slate-500">
          Educational content only. Not financial advice.
        </Text>
      </View>

      {isBlogLoading ? (
        <View className="mt-2">
          <LoadingState message="Fetching market blogs..." />
        </View>
      ) : null}

      {!isBlogLoading && blogError && blogSource === 'empty' ? (
        <View className="mt-2">
          <ErrorState message={blogError} />
        </View>
      ) : null}

      {!isBlogLoading && blogError && blogSource === 'cache' ? (
        <Text className="mt-2 text-xs font-semibold text-amber-700">{blogError}</Text>
      ) : null}

      {!isBlogLoading && !filteredMarketBlogs.length && blogSource !== 'empty' ? (
        <View className="mt-2">
          <EmptyState message="No market blog matched your search yet." />
        </View>
      ) : null}

      {!isBlogLoading && filteredMarketBlogs.length ? (
        <View className="mt-2 gap-3 pb-3">
          {filteredMarketBlogs.map((blog) => (
            <AppCard key={blog.id}>
              <Pressable accessibilityRole="button" onPress={() => openBlogUrl(blog.url)}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-lg font-black text-ink">{blog.title}</Text>
                    <Text className="mt-1.5 text-sm leading-5 text-slate-700">{blog.description}</Text>
                    <View className="mt-2 flex-row flex-wrap items-center gap-2">
                      <View className="rounded-full bg-forest-50 px-3 py-1">
                        <Text className="text-xs font-bold text-forest-700">
                          {blog.category.toUpperCase()}
                        </Text>
                      </View>
                      <Text className="text-xs text-slate-500">{blog.sourceName}</Text>
                      <Text className="text-xs text-slate-500">by {blog.authorName}</Text>
                    </View>
                    <Text className="mt-2 text-xs font-bold text-slate-500">
                      Published {formatDate(blog.publishedAt)}
                    </Text>
                  </View>
                  <View className="rounded-2xl bg-forest-100 p-3">
                    <FileText color="#1d4ed8" size={22} strokeWidth={2.8} />
                  </View>
                </View>
              </Pressable>
            </AppCard>
          ))}
        </View>
      ) : null}

      {!isBlogLoading && blogFetchedAt ? (
        <Text className="pb-2 text-center text-xs text-slate-500">
          Last synced {formatDate(blogFetchedAt)}.
        </Text>
      ) : null}
    </Screen>
  );
}
