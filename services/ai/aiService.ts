import { OfflineAIProvider } from "@/services/ai/OfflineAIProvider";
import type { AIResponse, ConversationTurn } from "@/types/ai";

const offlineProvider = new OfflineAIProvider();

export async function generateAIAnswer(
  question: string,
  conversation?: ConversationTurn[],
): Promise<AIResponse> {
  return offlineProvider.generateAnswer(question, conversation);
}
