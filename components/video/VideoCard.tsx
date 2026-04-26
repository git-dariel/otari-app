import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import type { CuratedVideo } from '@/types/content';
import { formatMinutes } from '@/utils/format';
import { getYoutubeThumbnailUrl } from '@/utils/video';

type VideoCardProps = {
  video: CuratedVideo;
  onPress: () => void;
};

export function VideoCard({ video, onPress }: VideoCardProps) {
  const thumbnailUrl = getYoutubeThumbnailUrl(video.url);

  return (
    <AppCard className="overflow-hidden" onPress={onPress}>
      <View className="mb-4 h-28 justify-between overflow-hidden rounded-3xl bg-forest-900 p-4">
        {thumbnailUrl ? (
          <Image
            accessibilityLabel={`${video.title} thumbnail`}
            contentFit="cover"
            source={{ uri: thumbnailUrl }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
        ) : null}
        <View className="absolute bottom-0 left-0 right-0 top-0 bg-forest-900/45" />
        <View className="h-10 w-10 items-center justify-center rounded-full bg-white/15">
          <Play color="#ffffff" fill="#ffffff" size={22} strokeWidth={2.5} />
        </View>
        <Text className="text-sm font-bold text-white">{video.creatorName}</Text>
      </View>
      <Text className="text-xl font-black text-ink">{video.title}</Text>
      <Text className="mt-2 text-base leading-6 text-slate-700">{video.reasonIncluded}</Text>
      <View className="mt-4 flex-row items-center gap-3">
        <Text className="rounded-full bg-forest-50 px-3 py-1 text-sm font-bold text-forest-700">
          {video.category}
        </Text>
        <Text className="text-sm font-bold text-slate-500">{formatMinutes(video.durationMinutes)}</Text>
      </View>
    </AppCard>
  );
}
