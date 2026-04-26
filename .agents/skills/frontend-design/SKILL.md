---
name: frontend-design
description: Use when designing or implementing InvestIQ PH React Native Expo screens, components, navigation, NativeWind styling, mobile UX, accessibility, and educational finance copy.
---

# Frontend Design Skill - React Native Expo + NativeWind

## Purpose

Use this skill when designing or implementing frontend screens, components, navigation, styling, and mobile UX for InvestIQ PH.

## Product design principles

1. Beginner-first
2. Calm and trustworthy
3. Educational, not hype-driven
4. Mobile-first and readable
5. Easy to navigate with one hand
6. Clear risk communication
7. Accessible tap targets

## Visual direction

Recommended style:

- Clean cards
- Soft spacing
- Professional finance education feel
- Friendly Taglish microcopy where helpful
- Avoid trading-terminal visual overload
- Avoid aggressive crypto/neon styling

## NativeWind conventions

Use NativeWind for styling:

```tsx
<View className="flex-1 bg-white px-4 pt-6">
  <Text className="text-2xl font-bold text-slate-900">
    Learn investing safely
  </Text>
</View>
```

Rules:

- Prefer `className` over inline styles.
- Use reusable components for repeated styles.
- Keep spacing consistent.
- Avoid too many nested views.
- Use semantic component names.

## Screen layout pattern

Use this pattern for screens:

```tsx
export function LearnScreen() {
  return (
    <Screen>
      <ScreenHeader title="Learn" subtitle="Start with beginner-friendly lessons." />
      <SearchInput />
      <CategoryFilter />
      <LessonList />
    </Screen>
  );
}
```

## Required states

Every data screen must handle:

- Loading
- Empty
- Error
- Success

Example:

```tsx
if (isLoading) return <LoadingState label="Loading lessons..." />;
if (error) return <ErrorState message="Unable to load lessons." />;
if (!lessons.length) return <EmptyState title="No lessons yet" />;
```

## Core screens

### Home screen

Should include:

- Greeting or welcome line
- Continue learning
- Beginner pathway
- Featured lesson
- Featured video
- Ask AI card
- Educational disclaimer

### Learn screen

Should include:

- Search
- Category filters
- Lesson cards
- Difficulty badges
- Progress indicator

### Lesson detail screen

Should include:

- Title
- Difficulty
- Estimated reading time
- Markdown body
- Key takeaways
- Risk notes
- Bookmark button
- Quiz button

### Videos screen

Should include:

- Category filters
- Video cards
- Creator attribution
- Reason included
- External open button

### Docs screen

Should include:

- Important references
- Simple document cards
- Tags
- Last updated date if available

### Chatbot screen

Should include:

- Disclaimer
- Suggested prompts
- Message list
- Input field
- Related sources
- Clear refusal messages for unsafe financial advice requests

## Component checklist

Before creating a component, ask:

- Is this reusable?
- Can it be typed clearly?
- Does it need loading/empty/error state?
- Does it follow accessible text size and tap target rules?
- Does it avoid financial advice wording?

## Accessibility rules

- Use readable text sizes.
- Buttons should be easy to tap.
- Add accessibility labels for icon-only buttons.
- Avoid color-only status indicators.
- Keep contrast strong.

## Copywriting rules

Prefer:

- "Learn the basics of ETFs."
- "Understand the risks before investing."
- "This is educational content, not financial advice."

Avoid:

- "Best stock to buy now."
- "Earn passive income easily."
- "Crypto profit strategy."
- "Guaranteed growth."

## Done checklist

- [ ] Screen works on mobile size.
- [ ] Uses TypeScript props.
- [ ] Uses NativeWind classes.
- [ ] Handles loading, empty, and error states.
- [ ] Has accessible tap targets.
- [ ] Uses educational-only wording.
