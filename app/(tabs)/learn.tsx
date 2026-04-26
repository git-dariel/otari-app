import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { PillFilter } from '@/components/common/PillFilter';
import { Screen } from '@/components/common/Screen';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { SearchBox } from '@/components/common/SearchBox';
import { EmptyState } from '@/components/common/StateViews';
import { LessonCard } from '@/components/learning/LessonCard';
import { LESSON_CATEGORIES } from '@/constants/app';
import { searchLessons } from '@/services/content/contentService';

export default function LearnScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const lessons = useMemo(() => searchLessons(query, category), [category, query]);

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Guided modules"
        title="Learn"
        subtitle="Beginner-safe concepts first."
      />
      <View className="mb-3">
        <SearchBox value={query} placeholder="Search lessons" onChangeText={setQuery} />
      </View>
      <View className="mb-4">
        <PillFilter items={LESSON_CATEGORIES} activeItem={category} onChange={setCategory} />
      </View>
      <View className="gap-4">
        {lessons.length ? (
          lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })}
            />
          ))
        ) : (
          <EmptyState message="Try another topic or clear your search." />
        )}
      </View>
    </Screen>
  );
}
