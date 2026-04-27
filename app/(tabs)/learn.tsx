import { Image } from "expo-image";
import { Linking, Pressable, Text, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { Screen } from "@/components/common/Screen";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { getTrustedCreators } from "@/services/content/trustedCreatorsService";

const TRUSTED_CREATORS = getTrustedCreators();

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
              onPress={() => openProfile(creator.profileUrl)}
            >
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
                <View className="mt-3 flex-row items-center">
                  <View className="rounded-full bg-forest-50 px-3 py-1.5">
                    <Text className="text-xs font-bold text-forest-700" numberOfLines={1}>
                      Open profile
                    </Text>
                  </View>
                  <Text className="ml-auto shrink-0 text-xs font-bold text-right text-slate-400">
                    Facebook
                  </Text>
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
