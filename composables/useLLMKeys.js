import { useLocalStorage } from "@vueuse/core";

export function useOpenAIKey() {
  return useLocalStorage(
    "twitter-bookmarks-openai-key",
    useRuntimeConfig().public.OPENAI_API_KEY || ""
  );
}

export function useGeminiKey() {
  return useLocalStorage(
    "twitter-bookmarks-gemini-key",
    useRuntimeConfig().public.GEMINI_API_KEY || ""
  );
}

export function useLLMKeys() {
  const openai = useLocalStorage(
    "twitter-bookmarks-openai-key",
    useRuntimeConfig().public.OPENAI_API_KEY || ""
  );
  const gemini = useLocalStorage(
    "twitter-bookmarks-gemini-key",
    useRuntimeConfig().public.GEMINI_API_KEY || ""
  );

  return {
    openai,
    gemini,
  };
}
