import { Image } from 'expo-image';
import { SendHorizontal } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppCard } from '@/components/common/AppCard';
import { Screen } from '@/components/common/Screen';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { searchKnowledge } from '@/services/content/contentService';
import { getSafetyRefusal, isUnsafeFinancialRequest } from '@/services/ai/safetyGuard';

const suggestedPrompts = [
  'What is an ETF?',
  'Why is crypto risky?',
  'What is risk tolerance?',
];

export default function ChatbotScreen() {
  const [question, setQuestion] = useState('');
  const [submittedQuestion, setSubmittedQuestion] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const answer = useMemo(() => {
    if (!submittedQuestion) {
      return '';
    }

    if (isUnsafeFinancialRequest(submittedQuestion)) {
      return getSafetyRefusal();
    }

    const related = searchKnowledge(submittedQuestion).slice(0, 2);

    if (!related.length) {
      return "I don't know from the current app content yet. Try asking about ETFs, risk tolerance, KYC, crypto risk, or scams.";
    }

    return `Based on app content, start with: ${related.map((item) => item.title).join(', ')}. This is educational only, so use it to learn the concept and risks before checking official sources.`;
  }, [submittedQuestion]);

  function submitQuestion(value = question) {
    const trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    setSubmittedQuestion(trimmed);
    setQuestion('');
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

  const composerBottomOffset = isKeyboardVisible
    ? Math.max(insets.bottom, 8) + 8
    : Math.max(insets.bottom, 12) + 92;

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
                <Text className="mt-2 text-base leading-7 text-slate-700">{answer}</Text>
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
