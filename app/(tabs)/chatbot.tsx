import { Image } from "expo-image";
import { ChevronDown, ChevronUp, SendHorizontal } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { Screen } from "@/components/common/Screen";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { generateAIAnswer } from "@/services/ai/aiService";
import {
  appendChatMessage,
  clearChatHistory,
  getChatHistory,
} from "@/services/ai/chatHistoryService";
import {
  clearLocalModel,
  getLocalModelState,
  refreshLocalModelState,
  startLocalModelDownload,
  subscribeToLocalModelState,
} from "@/services/ai/localModelManager";
import { CHAT_HISTORY_MAX_ITEMS, type ChatMessage, type LocalModelState } from "@/types/ai";

function createChatMessage(
  role: ChatMessage["role"],
  content: string,
  options?: Pick<ChatMessage, "sources" | "mode">,
): ChatMessage {
  return {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
    sources: options?.sources,
    mode: options?.mode,
  };
}

function trimMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.slice(-CHAT_HISTORY_MAX_ITEMS);
}

export default function ChatbotScreen() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isModelExpanded, setIsModelExpanded] = useState(false);
  const [modelState, setModelState] = useState<LocalModelState>(getLocalModelState());
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const modelStatusLabel =
    modelState.status === "not_downloaded"
      ? "Not downloaded"
      : modelState.status === "downloading"
        ? modelState.progress > 0.02
          ? `Downloading ${Math.round(modelState.progress * 100)}%`
          : "Downloading..."
        : modelState.status === "ready"
          ? "Ready offline"
          : "Unavailable (fallback active)";

  const shouldShowDownloadButton =
    modelState.status === "not_downloaded" || modelState.status === "unavailable";
  const shouldShowResetButton =
    modelState.status === "ready" ||
    modelState.status === "unavailable" ||
    modelState.status === "downloading";

  const modelStatusColor =
    modelState.status === "ready"
      ? "#047857"
      : modelState.status === "downloading"
        ? "#1d4ed8"
        : "#b45309";

  const composerBottomSpacing = useMemo(() => {
    if (isKeyboardVisible) {
      if (Platform.OS === "android") {
        return keyboardHeight + 8;
      }

      return Math.max(insets.bottom, 8);
    }

    return Math.max(insets.bottom, 12) + 88;
  }, [insets.bottom, isKeyboardVisible, keyboardHeight]);

  async function submitQuestion(value = question) {
    const trimmed = value.trim();

    if (!trimmed || isAnswerLoading) {
      return;
    }

    const userMessage = createChatMessage("user", trimmed);
    const nextConversation = [...messages, userMessage]
      .slice(-8)
      .map((message) => ({ role: message.role, content: message.content }));

    setMessages((previous) => trimMessages([...previous, userMessage]));
    setQuestion("");
    setIsAnswerLoading(true);

    try {
      await appendChatMessage(userMessage);
    } catch {
      // Keep in-memory chat even if persistence fails transiently.
    }

    try {
      const answer = await generateAIAnswer(trimmed, nextConversation);
      const assistantMessage = createChatMessage("assistant", answer.answer, {
        sources: answer.sources,
        mode: answer.mode,
      });

      setMessages((previous) => trimMessages([...previous, assistantMessage]));

      try {
        await appendChatMessage(assistantMessage);
      } catch {
        // Keep in-memory chat even if persistence fails transiently.
      }
    } catch {
      const fallbackMessage = createChatMessage(
        "assistant",
        "I had trouble starting the local assistant. Please try again. If this keeps happening, the app may need a development build with the local AI runtime included.",
        { mode: "fallback" },
      );

      setMessages((previous) => trimMessages([...previous, fallbackMessage]));

      try {
        await appendChatMessage(fallbackMessage);
      } catch {
        // Keep in-memory chat even if persistence fails transiently.
      }
    } finally {
      setIsAnswerLoading(false);
    }
  }

  async function handleClearHistory() {
    await clearChatHistory();
    setMessages([]);
  }

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (event) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
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

  useEffect(() => {
    let isMounted = true;

    getChatHistory()
      .then((history) => {
        if (!isMounted) {
          return;
        }

        setMessages(history.messages);
      })
      .finally(() => {
        if (isMounted) {
          setIsHistoryLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isAnswerLoading, isKeyboardVisible, messages.length]);

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
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View className="flex-1 pt-3">
          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerClassName="pb-5"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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
                  source={require("@/assets/character/robot.png")}
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

            <AppCard className="mb-4">
              <Pressable
                accessibilityRole="button"
                className="flex-row items-center justify-between"
                onPress={() => setIsModelExpanded((previous) => !previous)}
              >
                <View className="pr-2">
                  <Text className="text-xs font-black uppercase tracking-widest text-forest-700">
                    Local AI Model
                  </Text>
                  <Text className="mt-2 text-sm font-bold" style={{ color: modelStatusColor }}>
                    {modelStatusLabel}
                  </Text>
                </View>
                {isModelExpanded ? (
                  <ChevronUp color="#1d4ed8" size={18} />
                ) : (
                  <ChevronDown color="#1d4ed8" size={18} />
                )}
              </Pressable>

              {isModelExpanded ? (
                <View className="mt-4 border-t border-slate-100 pt-4">
                  {modelState.status === "downloading" ? (
                    <View className="mt-1 flex-row items-center">
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
                </View>
              ) : null}
            </AppCard>

            <Pressable
              accessibilityRole="button"
              className="mb-4 self-end rounded-full border border-forest-100 bg-white px-4 py-2"
              onPress={handleClearHistory}
            >
              <Text className="text-sm font-bold text-forest-700" numberOfLines={1}>
                Clear chat history
              </Text>
            </Pressable>

            {isHistoryLoading ? (
              <AppCard className="mb-4">
                <Text className="text-base leading-7 text-slate-700">Loading chat history...</Text>
              </AppCard>
            ) : null}

            {!isHistoryLoading && messages.length === 0 ? (
              <AppCard className="mb-4">
                <Text className="text-base leading-7 text-slate-700">
                  Start the conversation by asking a beginner investing question.
                </Text>
              </AppCard>
            ) : null}

            {messages.map((message) => {
              if (message.role === "user") {
                return (
                  <View className="mb-3 items-end" key={message.id}>
                    <View
                      className="rounded-[28px] bg-forest-600 px-5 py-4"
                      style={{ maxWidth: "82%" }}
                    >
                      <Text className="text-base font-semibold leading-6 text-white">
                        {message.content}
                      </Text>
                    </View>
                  </View>
                );
              }

              return (
                <AppCard className="mb-3" key={message.id}>
                  <View className="flex-row items-center">
                    <Image
                      accessibilityLabel="Otari AI robot avatar"
                      contentFit="contain"
                      source={require("@/assets/character/robot.png")}
                      style={{ width: 30, height: 30 }}
                    />
                    <Text className="ml-2 text-xs font-bold uppercase tracking-widest text-forest-600">
                      Otari tutor
                    </Text>
                  </View>
                  <Text className="mt-2 text-base leading-7 text-slate-700">{message.content}</Text>
                  {message.sources?.length ? (
                    <Text className="mt-3 text-xs font-semibold text-slate-500">
                      Sources: {message.sources.join(", ")}
                    </Text>
                  ) : null}
                  <Text className="mt-3 text-xs font-semibold text-slate-500">
                    Mode: {message.mode ?? "fallback"}
                  </Text>
                </AppCard>
              );
            })}

            {isAnswerLoading ? (
              <AppCard className="mb-3">
                <View className="flex-row items-center">
                  <ActivityIndicator color="#1d4ed8" />
                  <Text className="ml-2 text-base leading-7 text-slate-700">
                    Thinking with local assistant...
                  </Text>
                </View>
              </AppCard>
            ) : null}
          </ScrollView>

          <View
            className="min-h-14 flex-row items-center gap-3 rounded-full border border-forest-100 bg-white px-5"
            style={{ marginBottom: composerBottomSpacing }}
          >
            <TextInput
              className="flex-1 text-base font-semibold text-ink"
              placeholder="Ask an educational question"
              placeholderTextColor="#94a3b8"
              value={question}
              onChangeText={setQuestion}
              onSubmitEditing={() => submitQuestion()}
              returnKeyType="send"
            />
            <Pressable accessibilityRole="button" onPress={() => submitQuestion()}>
              <SendHorizontal
                color={isAnswerLoading ? "#94a3b8" : "#1d4ed8"}
                size={24}
                strokeWidth={2.8}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
