import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { BackButton } from '@/components/common/BackButton';
import { Screen } from '@/components/common/Screen';
import { ErrorState } from '@/components/common/StateViews';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { getDocumentById } from '@/services/content/contentService';
import { formatDate } from '@/utils/format';

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const document = getDocumentById(id);

  if (!document) {
    return (
      <Screen>
        <BackButton />
        <ErrorState message="Document not found." />
      </Screen>
    );
  }

  return (
    <Screen>
      <BackButton />
      <View className="mb-5">
        <Text className="text-xs font-bold uppercase tracking-widest text-forest-600">
          Reference doc
        </Text>
        <Text className="mt-2 text-4xl font-black leading-tight text-ink">{document.title}</Text>
        <Text className="mt-3 text-lg leading-7 text-slate-700">{document.description}</Text>
        <Text className="mt-3 text-sm font-bold text-slate-500">
          Updated {formatDate(document.updatedAt)}
        </Text>
      </View>
      <AppCard>
        <MarkdownRenderer markdown={document.bodyMarkdown} />
      </AppCard>
    </Screen>
  );
}
