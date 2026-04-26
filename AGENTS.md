# AGENTS.md - InvestIQ PH Mobile MVP

## Project identity

InvestIQ PH is a Filipino-focused mobile learning platform for beginner investors who want to understand stocks, ETFs, crypto basics, risk, scams, and long-term investing using curated Filipino-friendly videos, structured documentation, quizzes, bookmarks, and an AI learning assistant.

This repository uses:

- React Native with Expo
- TypeScript
- NativeWind / Tailwind CSS
- Local-first content for lessons and documentation
- Optional backend services for account sync, curated content updates, analytics, and AI retrieval

The MVP must stay educational. It must not become a trading app, investment advisory app, crypto signal app, or portfolio recommendation platform.

## Primary MVP goal

Ship a professional, reviewable MVP that proves this product can help Filipino beginners learn investing safely through organized modules, curated videos, important documentation, and a simple AI tutor experience.

## Non-negotiable product rules

1. Never provide buy, sell, hold, price target, signal, or guaranteed return advice.
2. Always position the product as educational only.
3. Use beginner-friendly Taglish where useful, but keep UI labels professional.
4. Avoid hype words such as "get rich," "easy profit," "sure win," or "guaranteed income."
5. Every financial lesson must include risk context.
6. Crypto content must highlight volatility, scams, self-custody risks, and regulatory uncertainty.
7. AI answers must be grounded in approved app content where possible.
8. Offline AI is a Phase 2 capability unless native model support has been proven on target devices.
9. React Native Expo must remain the default implementation path.
10. Keep implementation simple, testable, and maintainable.

## Repository guidance for Codex

When working in this repo, read these files before planning implementation:

- `.github/docs/readme.md`
- `.github/docs/architecture.md`
- `.github/docs/rules.md`
- `.github/docs/todo.md`
- `.agents/skills/frontend-design/SKILL.md`
- `.agents/skills/backend-design/SKILL.md`

Use the agent files in `.github/agents/` to role-play the correct review perspective before implementation.

## Expected workflow

For any feature request:

1. Restate the goal in one sentence.
2. Identify affected screens, services, data files, and tests.
3. Create a short implementation plan.
4. Implement the smallest working version.
5. Run type checks, linting, and relevant tests when available.
6. Review the work against `.github/docs/rules.md`.
7. Summarize changed files and verification steps.

## Suggested app structure

```txt
src/
  app/
  assets/
  components/
    common/
    content/
    learning/
    chatbot/
    video/
  constants/
  data/
    lessons/
    docs/
    videos/
    quizzes/
  features/
    home/
    learn/
    videos/
    documents/
    chatbot/
    bookmarks/
    onboarding/
  hooks/
  lib/
  navigation/
  services/
  store/
  styles/
  types/
  utils/
```

## Commands

Use pnpm for this repository. Use these commands unless the project defines alternatives:

```bash
pnpm install
pnpm run start
pnpm run android
pnpm run ios
pnpm run web
pnpm run lint
pnpm run typecheck
pnpm run test
```

If a command does not exist, do not invent results. Recommend adding it.

## Coding standards

- Use TypeScript strictly.
- Prefer named exports.
- Keep components small and composable.
- Use NativeWind classes for styling.
- Keep business logic out of screen files.
- Use service functions for data access.
- Use typed content models for lessons, videos, docs, quizzes, and chatbot knowledge.
- Avoid hardcoded finance claims that can become outdated.
- Use a clean, accessible UI with large tap targets.
- Avoid unnecessary dependencies.

## AI assistant standards

The in-app assistant must:

- Answer as an educational tutor, not a financial advisor.
- Say when it does not know.
- Encourage users to verify with official sources.
- Refuse requests for investment signals, insider tips, guaranteed returns, or risky speculation.
- Prefer explanations based on app lessons and documentation.
- Use simple examples like monthly investing, emergency fund, diversification, volatility, and risk tolerance.

## Definition of done

A task is done when:

- The feature works on Expo.
- TypeScript has no relevant errors.
- The UI follows NativeWind conventions.
- Content is educational and safe.
- Empty, loading, and error states are handled.
- No secrets are committed.
- The implementation is summarized clearly for review.

## Review checklist

Before finalizing any code, verify:

- Does this preserve the educational-only product positioning?
- Does this avoid personalized financial advice?
- Does this work for Filipino beginner investors?
- Is the UX simple enough for a first-time user?
- Can the feature work offline where expected?
- Does the code remain easy to maintain?
