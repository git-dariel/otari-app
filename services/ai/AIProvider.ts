import type { AIResponse, ConversationTurn } from "@/types/ai";

export interface AIProvider {
  generateAnswer(question: string, conversation?: ConversationTurn[]): Promise<AIResponse>;
}
