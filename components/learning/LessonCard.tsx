import { GraduationCap } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import type { Lesson } from '@/types/content';
import { formatMinutes } from '@/utils/format';

type LessonCardProps = {
  lesson: Lesson;
  onPress: () => void;
};

export function LessonCard({ lesson, onPress }: LessonCardProps) {
  return (
    <AppCard onPress={onPress}>
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-xs font-bold uppercase tracking-widest text-forest-600">
            {lesson.category}
          </Text>
          <Text className="mt-2 text-xl font-black leading-7 text-ink">{lesson.title}</Text>
          <Text className="mt-2 text-base leading-6 text-slate-700">{lesson.description}</Text>
        </View>
        <View className="rounded-2xl bg-forest-100 p-3">
          <GraduationCap color="#1d4ed8" size={24} strokeWidth={2.8} />
        </View>
      </View>
      <View className="mt-4 flex-row items-center gap-3">
        <Text className="rounded-full bg-forest-50 px-3 py-1 text-sm font-bold text-forest-700">
          {lesson.difficulty}
        </Text>
        <Text className="text-sm font-bold text-slate-500">{formatMinutes(lesson.estimatedMinutes)}</Text>
      </View>
    </AppCard>
  );
}
