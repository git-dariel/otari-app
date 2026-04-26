# Architecture — InvestIQ PH React Native Expo MVP

## Architecture goals

The architecture should be simple, local-first, and ready for future AI upgrades.

Goals:

- Fast MVP delivery
- Clean separation of features
- Type-safe content models
- Easy offline support for lessons, docs, videos metadata, bookmarks, and quizzes
- AI provider abstraction for online and future offline models
- Expo compatibility

## High-level architecture

```txt
React Native Expo App
  ├── Presentation Layer
  │   ├── Screens
  │   ├── Components
  │   └── Navigation
  │
  ├── Feature Layer
  │   ├── Learn
  │   ├── Videos
  │   ├── Documents
  │   ├── Chatbot
  │   ├── Bookmarks
  │   └── Onboarding
  │
  ├── Domain/Data Layer
  │   ├── Content models
  │   ├── Local JSON/Markdown content
  │   ├── Storage services
  │   └── AI provider interface
  │
  └── Infrastructure Layer
      ├── AsyncStorage / SQLite
      ├── Remote content API, optional
      ├── AI API, optional
      └── Analytics, optional
```

## Recommended source structure

```txt
src/
  app/
    AppProviders.tsx
  assets/
    images/
    icons/
  components/
    common/
      AppButton.tsx
      AppCard.tsx
      AppText.tsx
      EmptyState.tsx
      ErrorState.tsx
      LoadingState.tsx
      Screen.tsx
    content/
      MarkdownRenderer.tsx
      RiskNote.tsx
      TakeawayList.tsx
    learning/
      LessonCard.tsx
      LessonProgress.tsx
      QuizCard.tsx
    chatbot/
      ChatBubble.tsx
      ChatInput.tsx
      SuggestedPrompt.tsx
    video/
      VideoCard.tsx
      VideoCategoryFilter.tsx
  constants/
    app.ts
    routes.ts
    theme.ts
  data/
    lessons/
      investing-basics.json
      stocks-basics.json
      etf-basics.json
      crypto-basics.json
      risk-management.json
      scam-awareness.json
    docs/
      kyc.json
      risk-tolerance.json
      diversification.json
      disclaimer.json
    videos/
      videos.json
    quizzes/
      quizzes.json
  features/
    home/
      HomeScreen.tsx
    learn/
      LearnScreen.tsx
      LessonDetailScreen.tsx
      QuizScreen.tsx
    videos/
      VideosScreen.tsx
      VideoDetailScreen.tsx
    documents/
      DocumentsScreen.tsx
      DocumentDetailScreen.tsx
    chatbot/
      ChatbotScreen.tsx
    bookmarks/
      BookmarksScreen.tsx
    onboarding/
      OnboardingScreen.tsx
  hooks/
    useBookmarks.ts
    useLessonProgress.ts
    useChat.ts
  lib/
    markdown.ts
    validation.ts
  navigation/
    RootNavigator.tsx
    tabs.tsx
  services/
    ai/
      AIProvider.ts
      OnlineAIProvider.ts
      OfflineAIProvider.placeholder.ts
      aiService.ts
      safetyGuard.ts
    content/
      contentService.ts
      videoService.ts
      quizService.ts
    storage/
      bookmarkStorage.ts
      progressStorage.ts
  store/
    appStore.ts
  styles/
    global.css
  types/
    content.ts
    ai.ts
    navigation.ts
  utils/
    format.ts
    search.ts
```

## Content model

```ts
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
```

## AI provider abstraction

The app should not directly depend on one AI provider.

```ts
export type AIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AIResponse = {
  answer: string;
  sources?: string[];
  mode: 'online' | 'offline' | 'fallback';
};

export interface AIProvider {
  generateAnswer(messages: AIMessage[]): Promise<AIResponse>;
}
```

## Chatbot flow

```txt
User question
  ↓
Safety guard checks disallowed intent
  ↓
Retrieve related lessons/docs from local content
  ↓
Build AI prompt with educational-only rules
  ↓
Call selected AI provider
  ↓
Post-process response for disclaimer and safety
  ↓
Show answer with related lessons/docs
```

## Offline strategy

MVP offline support:

- Lessons: local JSON/Markdown
- Docs: local JSON/Markdown
- Video metadata: local JSON
- Bookmarks: AsyncStorage or SQLite
- Progress: AsyncStorage or SQLite
- Chatbot: fallback searchable FAQ when offline

Phase 2 offline AI:

- Add local model runtime only after device testing.
- Use native bridge if required.
- Consider Expo development build or prebuild.
- Keep `OfflineAIProvider` behind an interface.

## Storage recommendation

For MVP:

- Use AsyncStorage for bookmarks and progress.

For larger content and search:

- Use Expo SQLite.

## Navigation

Recommended MVP navigation:

```txt
Bottom Tabs
  ├── Home
  ├── Learn
  ├── Videos
  ├── Docs
  └── Ask AI

Stack routes
  ├── LessonDetail
  ├── Quiz
  ├── VideoDetail
  ├── DocumentDetail
  └── Bookmarks
```

## Backend recommendation

Backend is optional for MVP. Start without backend if content is manually bundled.

Add backend when needed for:

- Remote content updates
- Admin content management
- User sync
- AI retrieval logs
- Analytics

Recommended backend options:

- Supabase for simple auth, database, and storage
- Firebase for fast mobile MVP
- Express TypeScript if custom control is needed

## Testing strategy

Minimum:

- TypeScript type checks
- Component smoke tests
- Service unit tests for content loading, bookmarks, safety guard, and search

Manual checks:

- App opens on Expo Go or development build
- Lessons render correctly
- Videos open properly
- Bookmarks persist after restart
- Chatbot refuses financial advice requests
- Offline fallback works for docs/search
