export function useOpenAIKey() {
  return useState(
    "openai_api_key",
    () => useRuntimeConfig().public.OPENAI_API_KEY
  );
}
export function useGeminiKey() {
  return useState(
    "gemini_api_key",
    () => useRuntimeConfig().public.GEMINI_API_KEY
  );
}

export function useLLMKeys() {
  const openai = useState(
    "openai_api_key",
    () => useRuntimeConfig().public.OPENAI_API_KEY
  );
  const gemini = useState(
    "gemini_api_key",
    () => useRuntimeConfig().public.GEMINI_API_KEY
  );

  return {
    openai,
    gemini,
  };
}
