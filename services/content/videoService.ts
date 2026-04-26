import videosJson from '@/data/videos/videos.json';
import type { CuratedVideo } from '@/types/content';
import { filterByQuery } from '@/utils/search';

const videos = videosJson as CuratedVideo[];

export function getVideos(): CuratedVideo[] {
  return videos;
}

export function getFeaturedVideo(): CuratedVideo {
  return videos[0];
}

export function getVideoById(id: string): CuratedVideo | undefined {
  return videos.find((video) => video.id === id);
}

export function searchVideos(query: string): CuratedVideo[] {
  return filterByQuery(videos, query);
}
