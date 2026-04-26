import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  BookOpenCheck,
  GraduationCap,
  PlaySquare,
  ShieldCheck,
} from 'lucide-react-native';
import { Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { Screen } from '@/components/common/Screen';
import { APP_NAME } from '@/constants/app';
import {
  getDocuments,
  getFeaturedLesson,
  getLessons,
} from '@/services/content/contentService';
import { getFeaturedVideo } from '@/services/content/videoService';

const PATHWAY_BARS = [3, 5, 4, 7, 6, 9, 8] as const;

export default function HomeScreen() {
  const featuredLesson = getFeaturedLesson();
  const featuredVideo = getFeaturedVideo();
  const lessonCount = getLessons().length;
  const docCount = getDocuments().length;

  return (
    <Screen>
      {/* Page header — title + subtitle on the left, small pill CTA on the right */}
      <View className="mb-5 flex-row items-start justify-between pt-2">
        <View className="flex-1 pr-3">
          <Text className="text-3xl font-black text-ink">{APP_NAME}</Text>
        </View>
        <AppButton
          icon="auto-awesome"
          label="Ask Otari"
          onPress={() => router.push('/chatbot')}
          size="sm"
          variant="soft"
        />
      </View>

      {/* Hero pill — mascot avatar, eyebrow + headline, trailing icon */}
      <View className="mb-4 flex-row items-center rounded-[28px] bg-forest-50 p-4">
        <Image
          accessibilityLabel="Otari learning mascot"
          contentFit="contain"
          source={require('@/assets/character/character-main.png')}
          style={{ height: 72, width: 64 }}
        />
        <View className="ml-3 flex-1">
          <Text className="text-[10px] font-black uppercase tracking-widest text-forest-700">
            Your learning buddy
          </Text>
          <Text className="mt-0.5 text-xl font-black leading-tight text-ink">
            Learn investing safely.
          </Text>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white">
          <ShieldCheck color="#1d4ed8" size={20} strokeWidth={2.8} />
        </View>
      </View>

      {/* Two-column insight row — buddy quote + pathway mini-chart */}
      <View className="mb-4 flex-row gap-4">
        <View className="flex-1 rounded-[24px] bg-forest-50 px-4 py-5">
          <Text className="text-[10px] font-black uppercase tracking-widest text-forest-700">
            Meet your guide
          </Text>
          <Text className="mt-3 text-[13px] leading-6 text-slate-700">
            Learn muna before taking risk. I’ll point you to lessons, docs, and safer questions.
          </Text>
        </View>

        <View className="flex-1 rounded-[24px] bg-forest-50 px-4 py-5">
          <Text className="text-[10px] font-black uppercase tracking-widest text-forest-700">
            Beginner pathway
          </Text>
          <View className="mt-4 h-12 flex-row items-end gap-1.5">
            {PATHWAY_BARS.map((unit, index) => (
              <View
                key={`pathway-bar-${index}`}
                className={`flex-1 rounded-sm ${
                  index === PATHWAY_BARS.length - 2 ? 'bg-forest-600' : 'bg-forest-200'
                }`}
                style={{ height: unit * 5 }}
              />
            ))}
          </View>
          <View className="mt-3 flex-row justify-between">
            <Text className="text-[10px] font-bold text-slate-500">{lessonCount} Lessons</Text>
            <Text className="text-[10px] font-bold text-slate-500">{docCount} Docs</Text>
          </View>
        </View>
      </View>

      {/* Module cards — same structure as the reference's account list */}
      <AppCard className="mb-3" onPress={() => router.push('/learn')}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-forest-50">
              <BookOpenCheck color="#1d4ed8" size={22} strokeWidth={2.8} />
            </View>
            <View className="ml-3 flex-1 pr-2">
              <Text className="text-base font-black text-ink">Beginner pathway</Text>
              <Text className="text-xs text-slate-500">Continue learning</Text>
            </View>
          </View>
          <AppButton
            icon="arrow-forward"
            label="Continue"
            onPress={() => router.push('/learn')}
            size="sm"
            variant="soft"
          />
        </View>
        <Text className="mt-4 text-xl font-black leading-tight text-ink">
          Start with risk before products.
        </Text>
        <Text className="mt-2 text-sm leading-5 text-slate-600">
          Build vocabulary, understand uncertainty, then compare lessons at your own pace.
        </Text>
      </AppCard>

      <AppCard
        className="mb-3"
        onPress={() =>
          router.push({ pathname: '/lesson/[id]', params: { id: featuredLesson.id } })
        }>
        <View className="flex-row items-center">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-forest-50">
            <GraduationCap color="#1d4ed8" size={22} strokeWidth={2.8} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-black text-ink">Featured lesson</Text>
            <Text className="text-xs text-slate-500">{featuredLesson.category}</Text>
          </View>
        </View>
        <Text className="mt-4 text-xl font-black leading-tight text-ink">
          {featuredLesson.title}
        </Text>
        <Text className="mt-2 text-sm leading-5 text-slate-600">
          {featuredLesson.description}
        </Text>
      </AppCard>

      <AppCard
        className="mb-3"
        onPress={() =>
          router.push({ pathname: '/video/[id]', params: { id: featuredVideo.id } })
        }>
        <View className="flex-row items-center">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-forest-50">
            <PlaySquare color="#1d4ed8" size={22} strokeWidth={2.8} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-black text-ink">Featured video</Text>
            <Text className="text-xs text-slate-500">{featuredVideo.creatorName}</Text>
          </View>
        </View>
        <Text className="mt-4 text-xl font-black leading-tight text-ink">
          {featuredVideo.title}
        </Text>
        <Text className="mt-2 text-sm leading-5 text-slate-600">
          {featuredVideo.reasonIncluded}
        </Text>
      </AppCard>

    </Screen>
  );
}
