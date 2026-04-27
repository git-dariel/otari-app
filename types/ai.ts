export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

export type AIResponseMode = "offline" | "fallback";

export type AIResponse = {
  answer: string;
  mode: AIResponseMode;
  sources?: string[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: string[];
  mode?: AIResponseMode;
};

export type LocalModelStatus = "not_downloaded" | "downloading" | "ready" | "unavailable";

export type LocalModelInfo = {
  modelId: string;
  fileName: string;
  downloadUrl: string;
  expectedMd5?: string;
  sizeMb: number;
  minAppVersion: string;
};

export type LocalModelState = {
  status: LocalModelStatus;
  model: LocalModelInfo;
  localUri?: string;
  progress: number;
  errorMessage?: string;
};

export type ChatHistoryState = {
  messages: ChatMessage[];
};

export const CHAT_HISTORY_MAX_ITEMS = 100;

export interface AIProvider {
  generateAnswer(question: string, conversation?: ConversationTurn[]): Promise<AIResponse>;
}
