import type { AIResponse } from '@/types/ai';

export interface AIProvider {
  generateAnswer(question: string): Promise<AIResponse>;
}
