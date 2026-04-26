export function getYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace('www.', '');

    if (host === 'youtu.be') {
      const shortId = parsed.pathname.split('/').filter(Boolean)[0];
      return shortId ?? null;
    }

    if (!host.includes('youtube.com')) {
      return null;
    }

    if (parsed.pathname === '/watch') {
      return parsed.searchParams.get('v');
    }

    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const embedId = pathParts[0] === 'embed' ? pathParts[1] : null;
    const shortsId = pathParts[0] === 'shorts' ? pathParts[1] : null;

    return embedId ?? shortsId ?? null;
  } catch {
    return null;
  }
}

export function getYoutubeEmbedUrl(url: string): string | null {
  const videoId = getYoutubeVideoId(url);

  if (!videoId) {
    return null;
  }

  return `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1`;
}

export function getYoutubeWatchUrl(url: string): string | null {
  const videoId = getYoutubeVideoId(url);

  if (!videoId) {
    return null;
  }

  return `https://m.youtube.com/watch?v=${videoId}`;
}

export function getYoutubeThumbnailUrl(url: string): string | null {
  const videoId = getYoutubeVideoId(url);

  if (!videoId) {
    return null;
  }

  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
