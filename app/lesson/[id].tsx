import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { BackButton } from '@/components/common/BackButton';
import { Screen } from '@/components/common/Screen';
import { ErrorState } from '@/components/common/StateViews';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { RiskNote } from '@/components/content/RiskNote';
import { TakeawayList } from '@/components/content/TakeawayList';
import { getLessonById } from '@/services/content/contentService';
import { formatMinutes } from '@/utils/format';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = getLessonById(id);

  if (!lesson) {
    return (
      <Screen>
        <BackButton />
        <ErrorState message="Lesson not found." />
      </Screen>
    );
  }

  return (
    <Screen>
      <BackButton />
      <View className="mb-5">
        <Text className="text-xs font-bold uppercase tracking-widest text-forest-600">
          {lesson.category}
        </Text>
        <Text className="mt-2 text-4xl font-black leading-tight text-ink">{lesson.title}</Text>
        <Text className="mt-3 text-lg leading-7 text-slate-700">{lesson.description}</Text>
        <View className="mt-4 flex-row gap-3">
          <Text className="rounded-full bg-forest-100 px-4 py-2 text-sm font-bold text-forest-700">
            {lesson.difficulty}
          </Text>
          <Text className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600">
            {formatMinutes(lesson.estimatedMinutes)}
          </Text>
        </View>
      </View>

      <AppCard className="mb-4">
        <MarkdownRenderer markdown={lesson.bodyMarkdown} />
      </AppCard>

      <AppCard className="mb-4">
        <Text className="mb-4 text-xl font-black text-ink">Key takeaways</Text>
        <TakeawayList items={lesson.keyTakeaways} />
      </AppCard>

      <View className="mb-4">
        <RiskNote notes={lesson.riskNotes} />
      </View>

      <AppButton label="Quiz coming soon" icon="quiz" variant="soft" />
    </Screen>
  );
}
