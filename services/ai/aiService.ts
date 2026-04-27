import { OfflineAIProvider } from '@/services/ai/OfflineAIProvider';
import type { AIResponse } from '@/types/ai';

const offlineProvider = new OfflineAIProvider();

export async function generateAIAnswer(question: string): Promise<AIResponse> {
  return offlineProvider.generateAnswer(question);
}
