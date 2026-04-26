import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/common/Screen';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { SearchBox } from '@/components/common/SearchBox';
import { EmptyState } from '@/components/common/StateViews';
import { VideoCard } from '@/components/video/VideoCard';
import { searchVideos } from '@/services/content/videoService';

export default function VideosScreen() {
  const [query, setQuery] = useState('');
  const videos = useMemo(() => searchVideos(query), [query]);

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Curated watching"
        title="Videos"
        subtitle="Curated beginner explainers."
      />
      <View className="mb-4">
        <SearchBox value={query} placeholder="Search videos" onChangeText={setQuery} />
      </View>
      <View className="gap-4">
        {videos.length ? (
          videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPress={() => router.push({ pathname: '/video/[id]', params: { id: video.id } })}
            />
          ))
        ) : (
          <EmptyState message="No video matched your search yet." />
        )}
      </View>
    </Screen>
  );
}
