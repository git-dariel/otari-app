import { Image } from 'expo-image';
import { SendHorizontal } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { Screen } from '@/components/common/Screen';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { generateAIAnswer } from '@/services/ai/aiService';
import {
  clearLocalModel,
  getLocalModelState,
  refreshLocalModelState,
  startLocalModelDownload,
  subscribeToLocalModelState,
} from '@/services/ai/localModelManager';
import type { AIResponse, LocalModelState } from '@/types/ai';

const suggestedPrompts = [
  'What is an ETF?',
  'Why is crypto risky?',
  'What is risk tolerance?',
];

export default function ChatbotScreen() {
  const [question, setQuestion] = useState('');
  const [submittedQuestion, setSubmittedQuestion] = useState('');
  const [answerState, setAnswerState] = useState<AIResponse | null>(null);
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [modelState, setModelState] = useState<LocalModelState>(getLocalModelState());
  const insets = useSafeAreaInsets();

  async function submitQuestion(value = question) {
    const trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    setSubmittedQuestion(trimmed);
    setQuestion('');
    setIsAnswerLoading(true);
    try {
      const answer = await generateAIAnswer(trimmed);
      setAnswerState(answer);
    } catch {
      setAnswerState({
        answer:
          'I had trouble starting the local assistant. Please try again. If this keeps happening, the app may need a development build with the local AI runtime included.',
        mode: 'fallback',
      });
    } finally {
      setIsAnswerLoading(false);
    }
  }

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    refreshLocalModelState().then(setModelState);

    const unsubscribe = subscribeToLocalModelState((state) => {
      setModelState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const composerBottomOffset = isKeyboardVisible
    ? Math.max(insets.bottom, 8) + 8
    : Math.max(insets.bottom, 12) + 92;

  const modelStatusLabel =
    modelState.status === 'not_downloaded'
      ? 'Not downloaded'
      : modelState.status === 'downloading'
        ? modelState.progress > 0.02
          ? `Downloading ${Math.round(modelState.progress * 100)}%`
          : 'Downloading...'
        : modelState.status === 'ready'
          ? 'Ready offline'
          : 'Unavailable (fallback active)';

  const shouldShowDownloadButton =
    modelState.status === 'not_downloaded' || modelState.status === 'unavailable';
  const shouldShowResetButton =
    modelState.status === 'ready' ||
    modelState.status === 'unavailable' ||
    modelState.status === 'downloading';

  const modelStatusColor =
    modelState.status === 'ready'
      ? '#047857'
      : modelState.status === 'downloading'
        ? '#1d4ed8'
        : '#b45309';

  async function handleDownloadModel() {
    try {
      await startLocalModelDownload();
    } catch {
      // State is already handled by model manager.
    }
  }

  async function handleClearModel() {
    await clearLocalModel();
  }

  return (
    <Screen scroll={false}>
      <View className="flex-1 pt-3">
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-5"
          showsVerticalScrollIndicator={false}>
          <ScreenHeader
            eyebrow="AI tutor shell"
            title="Ask Otari"
            subtitle="Beginner questions only."
          />

          <View className="mb-5 flex-row items-center rounded-[24px] bg-forest-50 p-3">
            <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-2xl">
              <Image
                accessibilityLabel="Otari AI robot avatar"
                contentFit="contain"
                source={require('@/assets/character/robot.png')}
                style={{ width: 52, height: 52 }}
              />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs font-black uppercase tracking-widest text-forest-700">
                Otari AI
              </Text>
              <Text className="mt-1 text-sm leading-5 text-slate-700">
                Ask beginner questions and I will guide you using app content.
              </Text>
            </View>
          </View>

          <AppCard className="mb-5">
            <Text className="text-xs font-black uppercase tracking-widest text-forest-700">
              Local AI Model
            </Text>
            <Text className="mt-2 text-sm font-bold" style={{ color: modelStatusColor }}>
              {modelStatusLabel}
            </Text>
            {modelState.status === 'downloading' ? (
              <View className="mt-2 flex-row items-center">
                <ActivityIndicator color="#1d4ed8" />
                <Text className="ml-2 text-xs font-semibold text-slate-500">
                  Download in progress. Keep the app open.
                </Text>
              </View>
            ) : null}
            <Text className="mt-2 text-sm leading-5 text-slate-600">
              This assistant is educational only and runs offline when the model is ready.
            </Text>
            {shouldShowDownloadButton ? (
              <View className="mt-4">
                <AppButton
                  icon="download"
                  label="Download local model"
                  onPress={handleDownloadModel}
                  size="sm"
                />
              </View>
            ) : null}
            {shouldShowResetButton ? (
              <View className="mt-3">
                <AppButton
                  icon="delete-outline"
                  label="Clear local model"
                  onPress={handleClearModel}
                  size="sm"
                  variant="ghost"
                />
              </View>
            ) : null}
            {modelState.errorMessage ? (
              <Text className="mt-3 text-xs font-semibold text-amber-700">
                {modelState.errorMessage}
              </Text>
            ) : null}
          </AppCard>

          <View className="mb-5 flex-row gap-2.5" style={{ flexWrap: 'wrap' }}>
            {suggestedPrompts.map((prompt) => (
              <Pressable
                accessibilityRole="button"
                key={prompt}
                className="rounded-full border border-forest-100 bg-white px-4 py-3"
                onPress={() => submitQuestion(prompt)}>
                <Text className="text-sm font-bold text-forest-700">{prompt}</Text>
              </Pressable>
            ))}
          </View>

          {submittedQuestion ? (
            <View className="mb-4 gap-3">
              <View className="self-end rounded-app bg-forest-600 px-5 py-4">
                <Text className="max-w-72 text-base font-semibold leading-6 text-white">
                  {submittedQuestion}
                </Text>
              </View>
              <AppCard>
                <View className="flex-row items-center">
                  <Image
                    accessibilityLabel="Otari AI robot avatar"
                    contentFit="contain"
                    source={require('@/assets/character/robot.png')}
                    style={{ width: 30, height: 30 }}
                  />
                  <Text className="ml-2 text-xs font-bold uppercase tracking-widest text-forest-600">
                    Otari tutor
                  </Text>
                </View>
                {isAnswerLoading ? (
                  <Text className="mt-2 text-base leading-7 text-slate-700">
                    Thinking with local assistant...
                  </Text>
                ) : (
                  <Text className="mt-2 text-base leading-7 text-slate-700">
                    {answerState?.answer}
                  </Text>
                )}
                {answerState?.sources?.length ? (
                  <Text className="mt-3 text-xs font-semibold text-slate-500">
                    Sources: {answerState.sources.join(', ')}
                  </Text>
                ) : null}
                <Text className="mt-3 text-xs font-semibold text-slate-500">
                  Mode: {answerState?.mode ?? 'fallback'}
                </Text>
              </AppCard>
            </View>
          ) : null}
        </ScrollView>

        <View
          className="min-h-14 flex-row items-center gap-3 rounded-full border border-forest-100 bg-white px-5"
          style={{ marginBottom: composerBottomOffset }}>
          <TextInput
            className="flex-1 text-base font-semibold text-ink"
            placeholder="Ask an educational question"
            placeholderTextColor="#94a3b8"
            value={question}
            onChangeText={setQuestion}
            onSubmitEditing={() => submitQuestion()}
          />
          <Pressable accessibilityRole="button" onPress={() => submitQuestion()}>
            <SendHorizontal color="#1d4ed8" size={24} strokeWidth={2.8} />
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
