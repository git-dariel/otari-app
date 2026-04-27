import type { AIProvider } from '@/services/ai/AIProvider';
import { generateWithLocalLlama } from '@/services/ai/localLlamaRuntime';
import { getSafetyRefusal, isUnsafeFinancialRequest } from '@/services/ai/safetyGuard';
import { refreshLocalModelState } from '@/services/ai/localModelManager';
import { searchKnowledge } from '@/services/content/contentService';
import type { AIResponse } from '@/types/ai';
import type { KnowledgeDocument, Lesson } from '@/types/content';

type KnowledgeItem = Lesson | KnowledgeDocument;

function getItemBody(item: KnowledgeItem): string {
  return [
    item.description,
    item.bodyMarkdown,
    'keyTakeaways' in item ? item.keyTakeaways.join(' ') : undefined,
    'riskNotes' in item ? item.riskNotes.join(' ') : undefined,
  ]
    .filter(Boolean)
    .join('\n');
}

function buildKnowledgeContext(items: KnowledgeItem[]): string {
  if (!items.length) {
    return 'No directly matching approved app content was found.';
  }

  return items
    .map((item, index) => {
      const itemType = 'category' in item ? 'Lesson' : 'Document';
      return `${index + 1}. ${itemType}: ${item.title}\n${getItemBody(item)}`;
    })
    .join('\n\n');
}

function buildModelMessages(question: string, relatedItems: KnowledgeItem[]) {
  return [
    {
      role: 'system' as const,
      content:
        'You are Otari Tutor for InvestIQ PH. Help Filipino beginner investors learn safely. Keep answers educational only, beginner-friendly, and concise. Never give buy, sell, hold, trading signal, price prediction, guaranteed return, tax evasion, or KYC bypass advice. Prefer the approved app content when it is relevant. If app content is incomplete, say so briefly and give a general educational explanation with risk context.',
    },
    {
      role: 'user' as const,
      content: `Approved app content:\n${buildKnowledgeContext(relatedItems)}\n\nUser question:\n${question}`,
    },
  ];
}

function buildGroundedAnswer(question: string): AIResponse {
  const relatedItems = searchKnowledge(question).slice(0, 3);

  if (!relatedItems.length) {
    return {
      answer:
        "I don't know from current offline content yet. Try asking about ETF basics, risk tolerance, diversification, KYC, crypto risk, or scam awareness.",
      mode: 'fallback',
    };
  }

  const sources = relatedItems.map((item) => item.title);
  const primaryItem = relatedItems[0];
  const keyPoints =
    'keyTakeaways' in primaryItem && primaryItem.keyTakeaways.length
      ? primaryItem.keyTakeaways.slice(0, 2)
      : [primaryItem.description];
  const riskNotes =
    'riskNotes' in primaryItem && primaryItem.riskNotes.length
      ? primaryItem.riskNotes.slice(0, 2)
      : ['Always verify details with official sources before making decisions.'];
  const supportingSources = sources.slice(1);

  const supportingLine = supportingSources.length
    ? `You can also review ${supportingSources.join(', ')} for more context.`
    : 'You can ask a follow-up if you want a simpler example.';

  return {
    answer: `Based on offline app content: ${keyPoints.join(' ')} Risk reminder: ${riskNotes.join(' ')} ${supportingLine} This is educational only, not buy/sell advice.`,
    mode: 'offline',
    sources,
  };
}

export class OfflineAIProvider implements AIProvider {
  async generateAnswer(question: string): Promise<AIResponse> {
    if (isUnsafeFinancialRequest(question)) {
      return {
        answer: getSafetyRefusal(),
        mode: 'fallback',
      };
    }

    const relatedItems = searchKnowledge(question).slice(0, 3);
    const localModelState = await refreshLocalModelState();

    if (localModelState.status !== 'ready') {
      return buildGroundedAnswer(question);
    }

    if (localModelState.localUri) {
      try {
        const answer = await generateWithLocalLlama(
          localModelState.localUri,
          buildModelMessages(question, relatedItems),
        );

        return {
          answer,
          mode: 'offline',
          sources: relatedItems.map((item) => item.title),
        };
      } catch {
        const fallbackAnswer = buildGroundedAnswer(question);

        return {
          ...fallbackAnswer,
          answer: `I could not start the downloaded local model yet, so I used approved offline app content instead. ${fallbackAnswer.answer}`,
          mode: 'fallback',
        };
      }
    }

    return buildGroundedAnswer(question);
  }
}
