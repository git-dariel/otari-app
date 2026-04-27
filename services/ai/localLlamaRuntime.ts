import type { AIMessage } from "@/types/ai";

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
  "</s>",
  "<|end|>",
  "<|eot_id|>",
  "<|end_of_text|>",
  "<|im_end|>",
  "<|EOT|>",
  "<|END_OF_TURN_TOKEN|>",
  "<|end_of_turn|>",
  "<|endoftext|>",
  "User:",
  "Assistant:",
];

let contextPromise: Promise<LlamaContext> | null = null;
let contextModelUri: string | null = null;

function cleanModelAnswer(answer: string): string {
  return answer
    .replace(/<\/s>/g, "")
    .replace(/<\|im_end\|>/g, "")
    .replace(/^assistant\s*:?/i, "")
    .trim();
}

function estimateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function resolveAdaptivePredictTokens(messages: AIMessage[]): number {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user")?.content;

  const wordCount = estimateWordCount(latestUserMessage ?? "");

  if (wordCount <= 18) {
    return 180;
  }

  if (wordCount <= 45) {
    return 220;
  }

  return 260;
}

function loadLlamaModule(): LlamaModule {
  try {
    return require("llama.rn") as LlamaModule;
  } catch {
    throw new Error(
      "Could not load llama.rn runtime. Use a development build and restart Metro with a cleared cache.",
    );
  }
}

async function getLlamaContext(modelUri: string): Promise<LlamaContext> {
  if (contextPromise && contextModelUri === modelUri) {
    return contextPromise;
  }

  contextModelUri = modelUri;
  contextPromise = Promise.resolve()
    .then(() => {
      const llamaModule = loadLlamaModule();

      return llamaModule.initLlama({
        model: modelUri,
        n_ctx: 1280,
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
  const adaptivePredictTokens = resolveAdaptivePredictTokens(messages);
  const result = await context.completion({
    messages,
    n_predict: adaptivePredictTokens,
    stop: stopWords,
    temperature: 0.15,
    top_k: 30,
    top_p: 0.85,
    repeat_penalty: 1.12,
  });
  const answer = cleanModelAnswer(result.text ?? "");

  if (!answer) {
    throw new Error("Local model returned an empty answer.");
  }

  return answer;
}
