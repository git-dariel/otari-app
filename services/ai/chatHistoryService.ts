import AsyncStorage from "@react-native-async-storage/async-storage";

import { CHAT_HISTORY_MAX_ITEMS, type ChatHistoryState, type ChatMessage } from "@/types/ai";

const CHAT_HISTORY_STORAGE_KEY = "investiq.chat.history.v1";

const DEFAULT_CHAT_HISTORY: ChatHistoryState = {
  messages: [],
};

function toTrimmedHistory(messages: ChatMessage[]): ChatHistoryState {
  return {
    messages: messages.slice(-CHAT_HISTORY_MAX_ITEMS),
  };
}

export async function getChatHistory(): Promise<ChatHistoryState> {
  try {
    const rawHistory = await AsyncStorage.getItem(CHAT_HISTORY_STORAGE_KEY);

    if (!rawHistory) {
      return DEFAULT_CHAT_HISTORY;
    }

    const parsed = JSON.parse(rawHistory) as ChatHistoryState;
    const safeMessages = Array.isArray(parsed.messages) ? parsed.messages : [];

    return toTrimmedHistory(safeMessages);
  } catch {
    return DEFAULT_CHAT_HISTORY;
  }
}

export async function setChatHistory(messages: ChatMessage[]): Promise<ChatHistoryState> {
  const nextHistory = toTrimmedHistory(messages);
  await AsyncStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));

  return nextHistory;
}

export async function appendChatMessage(message: ChatMessage): Promise<ChatHistoryState> {
  const current = await getChatHistory();
  return setChatHistory([...current.messages, message]);
}

export async function clearChatHistory(): Promise<void> {
  await AsyncStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
}
