# Otari Mobile App

Otari is an educational mobile app built with React Native and Expo for beginner-friendly investing learning.  
The app focuses on market stocks, ETFs, crypto basics, and risk-aware learning content.

## Tech Stack

- React Native
- Expo
- Expo Router
- TypeScript
- NativeWind
- AsyncStorage

## Prerequisites

- Node.js 20+
- pnpm 10+
- Android Studio (for Android emulator) or a physical device
- Xcode (for iOS development on macOS only)

## Local Development

1. Install dependencies:

```bash
pnpm install
```

2. Start the Metro bundler:

```bash
pnpm run start
```

3. Run on a target platform:

```bash
pnpm run android
pnpm run ios
pnpm run web
```

## Quality Checks

Run these before creating a build:

```bash
pnpm run lint
pnpm run typecheck
```

## Project Structure

Key directories:

- `app/` - Expo Router screens and routes
- `components/` - shared UI components
- `services/` - business logic and data services
- `types/` - shared TypeScript models
- `assets/` - images, icons, and static assets

## Build and Release (EAS)

This project uses EAS Build for Android artifacts.

1. Log in to Expo:

```bash
pnpm exec eas login
```

2. Build an internal Android APK:

```bash
pnpm exec eas build --platform android --profile preview
```

3. Build a production Android AAB:

```bash
pnpm exec eas build --platform android --profile production
```

EAS build profiles are configured in `eas.json`.

## Product Guardrails

- Educational only; no buy/sell/hold recommendations
- No trading signals or price prediction features
- Content must include risk context and beginner-friendly explanations

## License

This project is currently private and intended for internal development.
