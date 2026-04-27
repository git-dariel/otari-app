export type Difficulty = 'beginner' | 'intermediate';

export type Lesson = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  bodyMarkdown: string;
  keyTakeaways: string[];
  riskNotes: string[];
  quizId?: string;
};

export type CuratedVideo = {
  id: string;
  title: string;
  creatorName: string;
  platform: 'youtube';
  url: string;
  category: string;
  difficulty: Difficulty;
  durationMinutes: number;
  reasonIncluded: string;
  riskNote?: string;
};

export type KnowledgeDocument = {
  id: string;
  title: string;
  description: string;
  bodyMarkdown: string;
  tags: string[];
  updatedAt: string;
};

export type MarketBlogCategory = 'stocks' | 'etf' | 'crypto' | 'investing';

export type MarketBlogArticle = {
  id: string;
  title: string;
  description: string;
  url: string;
  authorName: string;
  sourceName: string;
  category: MarketBlogCategory;
  tags: string[];
  publishedAt: string;
};

export type ContentItemType = 'lesson' | 'video' | 'document';

export type BookmarkPreview = {
  id: string;
  type: ContentItemType;
  title: string;
  description: string;
};
