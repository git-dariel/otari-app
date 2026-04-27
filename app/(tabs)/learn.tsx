import { Image } from 'expo-image';
import { Linking, Pressable, Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { Screen } from '@/components/common/Screen';
import { ScreenHeader } from '@/components/common/ScreenHeader';

type TrustedCreator = {
  id: string;
  name: string;
  profileUrl: string;
  description: string;
  profileImage: number;
};

const TRUSTED_CREATORS: TrustedCreator[] = [
  {
    id: 'tonichi-bonoan',
    name: 'Tonichi Bonoan',
    profileUrl: 'https://www.facebook.com/tonichi.bonoan',
    description: 'Personal finance and investing education for Filipino beginners.',
    profileImage: require('@/assets/creators/tonichi.jpg'),
  },
  {
    id: 'truly-rich-club',
    name: 'Truly Rich Club',
    profileUrl: 'https://www.facebook.com/officialtrulyrichclub',
    description: 'Long-term wealth building and values-based investing content.',
    profileImage: require('@/assets/creators/truly-rich-club.jpg'),
  },
  {
    id: 'juan-for-the-money',
    name: 'Juan For The Money',
    profileUrl: 'https://www.facebook.com/juanforthemoney',
    description: 'Taglish-friendly explainers on stocks, ETFs, and money habits.',
    profileImage: require('@/assets/creators/juan-for-the-money.jpg'),
  },
  {
    id: 'jacques-jax-reyes',
    name: 'Jacques Jax Reyes',
    profileUrl: 'https://www.facebook.com/jacquesjax.reyes',
    description: 'Beginner-focused market education and practical learning content.',
    profileImage: require('@/assets/creators/jac-reyes.jpg'),
  },
  {
    id: 'jem-and-jec',
    name: 'Jem and Jec',
    profileUrl: 'https://www.facebook.com/JemAndJec',
    description: 'Educational videos on investing mindset and financial literacy.',
    profileImage: require('@/assets/creators/jem-and-jec.jpg'),
  },
];

export default function LearnScreen() {
  async function openProfile(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      // Keep this fail-safe simple; page remains usable.
    }
  }

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Trusted creators"
        title="Learn"
        subtitle="Explore verified creator pages for educational investing content."
      />
      <View className="gap-4">
        {TRUSTED_CREATORS.map((creator) => (
          <AppCard key={creator.id}>
            <Pressable
              accessibilityRole="button"
              className="flex-row items-center"
              onPress={() => openProfile(creator.profileUrl)}>
              <View className="h-[52px] w-[52px] overflow-hidden rounded-full">
                <Image
                  source={creator.profileImage}
                  contentFit="cover"
                  style={{ height: 52, width: 52 }}
                  accessibilityLabel={`${creator.name} profile avatar`}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-black text-ink">{creator.name}</Text>
                <Text className="mt-1 text-xs leading-5 text-slate-600">{creator.description}</Text>
                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-xs font-bold text-forest-700">Open profile</Text>
                  <Text className="text-xs font-bold text-slate-400">Facebook</Text>
                </View>
              </View>
            </Pressable>
          </AppCard>
        ))}
      </View>
      <View className="pb-2 pt-5">
        <Text className="text-center text-sm font-semibold text-slate-500">
          More trusted content creators soon.
        </Text>
      </View>
    </Screen>
  );
}
