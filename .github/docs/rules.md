# Product, Safety, and Engineering Rules

## Product rules

1. The app is educational only.
2. Do not provide investment advice.
3. Do not recommend specific assets as personalized picks.
4. Do not include price prediction features.
5. Do not include trading signals.
6. Do not include guaranteed profit claims.
7. Do not encourage leverage, hype trading, pump groups, or FOMO behavior.
8. Keep explanations beginner-friendly.
9. Use Filipino context where helpful.
10. Keep all financial examples clearly hypothetical.

## Content rules

Every lesson should include:

- Clear objective
- Simple explanation
- Example
- Risk note
- Key takeaways
- Optional quiz

Avoid:

- "This stock will go up."
- "Buy this ETF."
- "Crypto is the future, invest now."
- "You can earn passive income easily."
- "Guaranteed returns."

Prefer:

- "An ETF is a basket of investments."
- "Diversification can reduce concentration risk, but it does not remove all risk."
- "Crypto is highly volatile and may not be suitable for everyone."
- "Long-term investing still involves risk and possible losses."

## Chatbot rules

The chatbot must refuse or redirect when users ask for:

- What stock should I buy?
- Is this coin going to pump?
- Give me a trading signal.
- Should I sell now?
- What will be the price tomorrow?
- How do I get rich fast?
- How do I avoid taxes?
- How do I bypass KYC?

Recommended safe response style:

> I can't tell you what to buy or sell. But I can explain the concept, risks, and questions you may consider before making your own decision.

## UI rules

- Use readable typography.
- Use large touch targets.
- Avoid cluttered screens.
- Prefer cards, sections, and progressive disclosure.
- Always handle empty, loading, and error states.
- Show disclaimers where users might interpret content as advice.
- Keep content scannable.

## Technical rules

- Use TypeScript types for all content models.
- Keep data access in services.
- Keep screen components focused on UI orchestration.
- Use NativeWind for styling.
- Avoid inline complex logic in JSX.
- Avoid storing secrets in the app bundle.
- Use environment variables for API keys.
- Validate all remote content.
- Cache content where possible.
- Prefer local-first MVP behavior.

## Expo rules

- Stay compatible with Expo unless a native feature is explicitly approved.
- For native local AI experiments, document why Expo prebuild or development build is required.
- Do not assume Apple Intelligence, Gemini Nano, or OEM AI APIs are directly accessible from Expo.
- Build an abstraction layer for AI providers.

## Offline AI rules

Offline AI is not required for MVP launch unless proven feasible.

When designing offline AI:

- Use an `AIProvider` interface.
- Support `online`, `offline`, and `fallback` modes.
- Keep model files optional and downloadable where legally allowed.
- Do not bundle huge models without size analysis.
- Do not rely on private phone AI APIs without official support.
- Always provide a non-AI fallback such as searchable docs.

## Commit rules

Use clear commit messages:

```txt
feat(learn): add lesson detail screen
fix(chatbot): handle empty user messages
chore(content): add ETF beginner module
refactor(video): extract video card component
```

## Pull request checklist

- [ ] Feature is scoped to MVP.
- [ ] No investment advice or signals.
- [ ] TypeScript types are updated.
- [ ] UI handles empty/loading/error states.
- [ ] Content has risk notes.
- [ ] Relevant tests or manual checks are included.
- [ ] No secrets or private keys are committed.
