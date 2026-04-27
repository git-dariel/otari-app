import type { AIMessage } from '@/types/ai';

type LlamaCompletionResult = {
  text?: string;
};

type LlamaContext = {
  completion: (
    params: {
      messages: AIMessage[];
      n_predict?: number;
      stop?: string[];
      temperature?: number;
      top_k?: number;
      top_p?: number;
      repeat_penalty?: number;
    },
    onToken?: (data: { token?: string }) => void,
  ) => Promise<LlamaCompletionResult>;
};

type LlamaModule = {
  initLlama: (params: {
    model: string;
    n_ctx?: number;
    n_gpu_layers?: number;
    use_mlock?: boolean;
  }) => Promise<LlamaContext>;
};

const stopWords = [
  '</s>',
  '<|end|>',
  '<|eot_id|>',
  '<|end_of_text|>',
  '<|im_end|>',
  '<|EOT|>',
  '<|END_OF_TURN_TOKEN|>',
  '<|end_of_turn|>',
  '<|endoftext|>',
  'User:',
  'Assistant:',
];

let contextPromise: Promise<LlamaContext> | null = null;
let contextModelUri: string | null = null;

function cleanModelAnswer(answer: string): string {
  return answer
    .replace(/<\/s>/g, '')
    .replace(/<\|im_end\|>/g, '')
    .replace(/^assistant\s*:?/i, '')
    .trim();
}

async function getLlamaContext(modelUri: string): Promise<LlamaContext> {
  if (contextPromise && contextModelUri === modelUri) {
    return contextPromise;
  }

  contextModelUri = modelUri;
  contextPromise = import('llama.rn')
    .then((module) => {
      const llamaModule = module as LlamaModule;

      return llamaModule.initLlama({
        model: modelUri,
        n_ctx: 1536,
        n_gpu_layers: 0,
        use_mlock: false,
      });
    })
    .catch((error) => {
      contextPromise = null;
      contextModelUri = null;
      throw error;
    });

  return contextPromise;
}

export async function generateWithLocalLlama(
  modelUri: string,
  messages: AIMessage[],
): Promise<string> {
  const context = await getLlamaContext(modelUri);
  const result = await context.completion({
    messages,
    n_predict: 220,
    stop: stopWords,
    temperature: 0.2,
    top_k: 40,
    top_p: 0.9,
    repeat_penalty: 1.1,
  });
  const answer = cleanModelAnswer(result.text ?? '');

  if (!answer) {
    throw new Error('Local model returned an empty answer.');
  }

  return answer;
}
