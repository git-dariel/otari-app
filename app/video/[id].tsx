import { useLocalSearchParams } from 'expo-router';
import { Play } from 'lucide-react-native';
import { Linking, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { BackButton } from '@/components/common/BackButton';
import { Screen } from '@/components/common/Screen';
import { ErrorState } from '@/components/common/StateViews';
import { RiskNote } from '@/components/content/RiskNote';
import { getVideoById } from '@/services/content/videoService';
import { formatMinutes } from '@/utils/format';
import { getYoutubeWatchUrl } from '@/utils/video';

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const video = getVideoById(id);

  if (!video) {
    return (
      <Screen>
        <BackButton />
        <ErrorState message="Video not found." />
      </Screen>
    );
  }

  const watchUrl = getYoutubeWatchUrl(video.url) ?? video.url;
  const canRenderWebPlayer = Boolean(watchUrl);

  return (
    <Screen>
      <BackButton />
      <View className="mb-5 overflow-hidden rounded-[36px] bg-forest-900">
        {canRenderWebPlayer ? (
          <WebView
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction
            source={{ uri: watchUrl }}
            style={{ height: 220, width: '100%' }}
          />
        ) : (
          <View className="h-56 justify-between p-6">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-white/15">
              <Play color="#ffffff" fill="#ffffff" size={30} strokeWidth={2.5} />
            </View>
            <View>
              <Text className="text-sm font-bold uppercase tracking-widest text-forest-200">
                {video.category}
              </Text>
              <Text className="mt-2 text-3xl font-black leading-tight text-white">{video.title}</Text>
            </View>
          </View>
        )}
      </View>

      <AppCard className="mb-4">
        <Text className="text-xs font-bold uppercase tracking-widest text-forest-600">
          {video.creatorName}
        </Text>
        <Text className="mt-2 text-base leading-7 text-slate-700">{video.reasonIncluded}</Text>
        <Text className="mt-4 text-sm font-bold text-slate-500">
          {video.difficulty} • {formatMinutes(video.durationMinutes)}
        </Text>
      </AppCard>

      {video.riskNote ? (
        <View className="mb-4">
          <RiskNote notes={[video.riskNote]} />
        </View>
      ) : null}

      {!canRenderWebPlayer ? (
        <AppButton label="Open video" icon="open-in-new" onPress={() => Linking.openURL(video.url)} />
      ) : null}
    </Screen>
  );
}
