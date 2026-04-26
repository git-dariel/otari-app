import { router } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { Screen } from '@/components/common/Screen';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { SearchBox } from '@/components/common/SearchBox';
import { EmptyState } from '@/components/common/StateViews';
import { searchDocuments } from '@/services/content/contentService';
import { formatDate } from '@/utils/format';

export default function DocumentsScreen() {
  const [query, setQuery] = useState('');
  const documents = useMemo(() => searchDocuments(query), [query]);

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Reference docs"
        title="Docs"
        subtitle="Quick references and safety notes."
      />
      <View className="mb-4">
        <SearchBox value={query} placeholder="Search docs" onChangeText={setQuery} />
      </View>
      <View className="gap-4">
        {documents.length ? (
          documents.map((document) => (
            <AppCard
              key={document.id}
              onPress={() => router.push({ pathname: '/document/[id]', params: { id: document.id } })}>
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-xl font-black text-ink">{document.title}</Text>
                  <Text className="mt-2 text-base leading-6 text-slate-700">{document.description}</Text>
                  <Text className="mt-3 text-sm font-bold text-slate-500">
                    Updated {formatDate(document.updatedAt)}
                  </Text>
                </View>
                <View className="rounded-2xl bg-forest-100 p-3">
                  <FileText color="#1d4ed8" size={24} strokeWidth={2.8} />
                </View>
              </View>
            </AppCard>
          ))
        ) : (
          <EmptyState message="No document matched your search yet." />
        )}
      </View>
    </Screen>
  );
}
