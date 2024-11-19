import { ref, watch } from "vue";
import { createOpenAI, type OpenAIProvider, openai } from "@ai-sdk/openai";
import {
  createGoogleGenerativeAI,
  type GoogleGenerativeAIProvider,
} from "@ai-sdk/google";
import {
  streamText,
  type CoreMessage,
  type LanguageModelUsage,
  type LanguageModelV1,
  type Message,
} from "ai";

const PROVIDER_TO_MODEL = {
  openai: "gpt-4o-mini",
  geminiPro: "gemini-1.5-pro-latest",
  geminiFlash: "gemini-1.5-flash-002",
};

export function useLLM(
  modelProvider: Ref<"openai" | "geminiPro" | "geminiFlash">
) {
  const isStreaming = ref(false);
  const streamedResponse = ref("");

  const { openai: openaiApiKey, gemini: geminiApiKey } = useLLMKeys();

  let client: OpenAIProvider | GoogleGenerativeAIProvider;

  function initializeAI() {
    if (modelProvider.value === "openai") {
      client = createOpenAI({
        apiKey: openaiApiKey.value,
        compatibility: "strict",
      });
    } else if (
      modelProvider.value === "geminiPro" ||
      modelProvider.value === "geminiFlash"
    ) {
      client = createGoogleGenerativeAI({
        apiKey: geminiApiKey.value,
      });
    }
  }

  initializeAI();

  watch([openaiApiKey, geminiApiKey, modelProvider], () => {
    initializeAI();
  });

  function recordTokenUsage({
    promptTokens,
    completionTokens,
    totalTokens,
  }: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  }) {
    console.log("Prompt tokens:", promptTokens);
    console.log("Completion tokens:", completionTokens);
    console.log("Total tokens:", totalTokens);
  }

  async function streamCompletion(
    messages: Message[],
    callback: (chunk: string) => void,
    usageCallback: (usage: LanguageModelUsage) => void
  ) {
    isStreaming.value = true;
    streamedResponse.value = "";

    try {
      const stream = await streamText({
        model: client(
          PROVIDER_TO_MODEL[modelProvider.value]
        ) as LanguageModelV1,
        messages: messages as CoreMessage[],
      });

      for await (const chunk of stream.textStream) {
        if (callback) {
          callback(chunk);
        } else {
          streamedResponse.value += chunk;
        }
      }

      const usage = await stream.usage;
      if (usage) {
        console.log("Token usage data:", usage);
        recordTokenUsage(usage);
        if (usageCallback) {
          usageCallback(usage);
        }
      } else {
        console.log("Token usage data not available");
      }
    } catch (error) {
      console.error("Error in useLLM:", error);
      throw error;
    } finally {
      isStreaming.value = false;
    }
  }

  return {
    streamCompletion,
    isStreaming,
    streamedResponse,
  };
}
