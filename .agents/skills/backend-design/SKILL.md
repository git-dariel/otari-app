---
name: backend-design
description: Use when designing InvestIQ PH APIs, data services, content sync, AI retrieval, authentication, analytics, local-first storage, or future admin workflows.
---

# Backend Design Skill - Optional Services for InvestIQ PH

## Purpose

Use this skill when designing APIs, data services, content sync, AI retrieval, authentication, analytics, or future admin workflows.

The MVP can launch without a backend. Add backend only when it improves content updates, AI grounding, account sync, or operational control.

## Backend philosophy

1. Local-first where possible.
2. Keep MVP simple.
3. Avoid collecting sensitive financial data.
4. Do not store brokerage credentials, wallet keys, seed phrases, or exchange API keys.
5. Treat AI conversations as sensitive.
6. Keep financial content educational.

## Recommended backend options

### Option A - No backend

Best for earliest MVP.

Use bundled JSON/Markdown content and local storage.

Pros:

- Fastest
- Cheapest
- Offline-friendly
- Fewer privacy risks

Cons:

- App updates needed for content changes
- No account sync
- Limited analytics

### Option B - Supabase

Best for simple production MVP.

Use for:

- Auth
- Remote content
- Bookmarks sync
- Progress sync
- Admin content tables

### Option C - Firebase

Best for fast mobile iteration.

Use for:

- Auth
- Firestore content
- Remote config
- Analytics
- Crash reporting

### Option D - Express TypeScript API

Best when the user wants full backend control.

Use for:

- Custom content APIs
- AI retrieval and prompt management
- Admin tools
- Rate limiting
- Audit logging

## Minimal API design

Only add these APIs when needed:

```txt
GET /health
GET /content/lessons
GET /content/docs
GET /content/videos
GET /content/quizzes
POST /ai/ask
GET /me/progress
PUT /me/progress/:lessonId
GET /me/bookmarks
POST /me/bookmarks
DELETE /me/bookmarks/:bookmarkId
```

## AI backend flow

```txt
Mobile app
  | POST /ai/ask
API validates request
  |
Safety guard checks intent
  |
Retrieval finds relevant approved content
  |
AI model generates educational answer
  |
API post-processes response
  |
Mobile app displays answer + related sources
```

## AI request model

```ts
export type AskAIRequest = {
  question: string;
  languagePreference: 'en' | 'taglish';
  conversationId?: string;
};
```

## AI response model

```ts
export type AskAIResponse = {
  answer: string;
  refusal?: boolean;
  relatedContent: Array<{
    id: string;
    type: 'lesson' | 'document';
    title: string;
  }>;
};
```

## Content database tables

If using a backend database:

### lessons

```txt
id
slug
title
description
category
difficulty
estimated_minutes
body_markdown
key_takeaways
risk_notes
quiz_id
published
created_at
updated_at
```

### documents

```txt
id
slug
title
description
body_markdown
tags
published
created_at
updated_at
```

### videos

```txt
id
title
creator_name
platform
url
category
difficulty
reason_included
risk_note
published
created_at
updated_at
```

### quizzes

```txt
id
lesson_id
title
questions_json
created_at
updated_at
```

### user_progress

```txt
id
user_id
lesson_id
progress_percent
completed
last_opened_at
completed_at
updated_at
```

### bookmarks

```txt
id
user_id
item_id
item_type
title
created_at
```

## Security requirements

- Use HTTPS only.
- Validate all inputs.
- Rate limit AI endpoints.
- Never expose AI provider keys to the mobile app.
- Do not log full sensitive financial user details.
- Store minimal personal data.
- Add audit logs for admin content changes.
- Use role-based access for admin tools.

## AI safety requirements

The backend must refuse:

- Personalized buy/sell advice
- Price predictions
- Trading signals
- Tax evasion
- KYC bypassing
- Scam-like investment schemes

## Error response format

```ts
export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

## Done checklist

- [ ] API has typed request and response models.
- [ ] Secrets are server-side only.
- [ ] AI route has safety guard.
- [ ] User data collected is minimal.
- [ ] Educational-only rules are enforced.
- [ ] Rate limiting is considered.
- [ ] Errors are safe and readable.
