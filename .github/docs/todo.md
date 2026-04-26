# MVP Roadmap and Task Board

## Phase 0 - Project setup

- [x] Create Expo TypeScript project
- [x] Install NativeWind
- [x] Configure NativeWind
- [x] Add navigation
- [x] Add path aliases
- [x] Add lint and typecheck scripts
- [x] Create base folder structure
- [x] Create app constants and route names
- [x] Add reusable UI components

## Phase 1 - Static content MVP

- [x] Define content TypeScript models
- [x] Create sample lesson JSON files
- [x] Create sample docs JSON files
- [x] Create sample curated video metadata
- [x] Create content service
- [x] Add markdown renderer
- [x] Add search utility

## Phase 2 - Core screens

- [x] Home screen
- [x] Learn list screen
- [x] Lesson detail screen
- [x] Videos screen
- [x] Video detail/open screen
- [x] Docs list screen
- [x] Document detail screen
- [x] Bookmarks screen
- [x] Chatbot screen shell

## Phase 3 - Bookmarks and progress

- [ ] Add bookmark storage service
- [ ] Add lesson progress storage service
- [ ] Add bookmark button to lessons
- [ ] Add bookmark button to videos
- [ ] Add bookmark button to docs
- [ ] Add continue learning card

## Phase 4 - Quiz MVP

- [ ] Define quiz model
- [ ] Add quiz data
- [ ] Add quiz service
- [ ] Add quiz screen
- [ ] Show score summary
- [ ] Show answer explanations

## Phase 5 - Chatbot MVP

- [ ] Define AI provider interface
- [ ] Add safety guard
- [ ] Add local retrieval from lessons/docs
- [ ] Add online provider implementation
- [ ] Add fallback provider for offline mode
- [ ] Add suggested prompts
- [ ] Add chatbot disclaimer
- [ ] Test refusal patterns

## Phase 6 - Polish

- [ ] Add onboarding
- [ ] Add empty states
- [ ] Add loading states
- [ ] Add error states
- [ ] Add accessibility labels
- [ ] Improve spacing and typography
- [ ] Add app icon and splash screen
- [ ] Prepare demo content

## Phase 7 - Validation

- [ ] Test on Android physical device
- [ ] Test on iOS simulator/device if available
- [ ] Verify offline lesson/docs behavior
- [ ] Verify videos open correctly
- [ ] Verify chatbot safety behavior
- [ ] Verify no API keys are committed
- [ ] Prepare MVP demo script

## Future phase - Offline AI research

- [ ] Research Expo-compatible local LLM options
- [ ] Test llama.cpp or ONNX runtime feasibility
- [ ] Test model file size and memory usage
- [ ] Benchmark response speed on low-end Android
- [ ] Confirm licensing of chosen model
- [ ] Build native bridge only if justified
- [ ] Keep searchable docs fallback available
