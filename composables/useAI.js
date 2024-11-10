import { ref, watch } from "vue";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

const PROVIDER_TO_MODEL = {
  openai: "gpt-4o-mini",
  gemini: "gemini-1.5-pro-latest",
};

export function useAI(modelProvider = "openai") {
  const isStreaming = ref(false);
  const streamedResponse = ref("");

  const openaiApiKey = useOpenAIKey();
  const geminiApiKey = useGeminiKey();

  let client;

  function initializeAI() {
    if (toValue(modelProvider) === "openai") {
      client = createOpenAI({
        apiKey: openaiApiKey.value,
        compatibility: "strict",
      });
    } else if (toValue(modelProvider) === "gemini") {
      client = createGoogleGenerativeAI({
        apiKey: geminiApiKey.value,
      });
    }

    console.log("client initialized", client("gpt-4o-mini"));
  }

  initializeAI();

  watch([openaiApiKey, geminiApiKey], () => {
    initializeAI();
  });
  watch(
    () => toValue(modelProvider),
    () => {
      console.log("modelProvider changed", toValue(modelProvider));
      initializeAI();
    }
  );

  function recordTokenUsage({ promptTokens, completionTokens, totalTokens }) {
    console.log("Prompt tokens:", promptTokens);
    console.log("Completion tokens:", completionTokens);
    console.log("Total tokens:", totalTokens);
  }

  async function streamCompletion(
    messages,
    callback = null,
    usageCallback = null
  ) {
    isStreaming.value = true;
    streamedResponse.value = "";

    try {
      const stream = await streamText({
        model: client(PROVIDER_TO_MODEL[toValue(modelProvider)]),
        messages: messages,
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
      console.error("Error in useAI:", error);
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
