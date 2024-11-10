import { ref, watch } from "vue";
import bookmarksData from "~/bookmarks.json";

export function useBookmarkChat(modelProvider) {
  const { streamCompletion, isStreaming } = useLLM(modelProvider);
  const isLoading = ref(false);
  const currentAssistantMessage = ref("");
  const conversationHistory = ref([]);
  const tokenUsage = ref(null);
  const errorMessage = ref("");

  // // For development purposes, we limit the number of bookmarks to 100
  if (process.env.NODE_ENV === "development") {
    bookmarksData.data = bookmarksData.data.slice(0, 100);
  }
  const systemMessage = {
    role: "system",
    content: `You are an AI assistant that answers questions about the user's Twitter bookmarks. When referencing a particular bookmark, you must return the exact json of that bookmark in json format.
  
  Here are the bookmarks:
  
  ${JSON.stringify(bookmarksData.data, null, 2)}
  
  Provide relevant responses based on these bookmarks and the user's queries.`,
  };

  async function chatWithBookmarks(query) {
    isLoading.value = true;
    currentAssistantMessage.value = "";
    errorMessage.value = ""; // Reset error message

    try {
      // Add user message to conversation history
      conversationHistory.value.push({ role: "user", content: query });

      // Prepare messages for the API call
      const messages = [systemMessage, ...conversationHistory.value];

      await streamCompletion(
        messages,
        (chunk) => {
          currentAssistantMessage.value += chunk;
        },
        (usage) => {
          tokenUsage.value = usage;
        }
      );
    } catch (error) {
      console.error("Error:", error);
      errorMessage.value = error.message;
    } finally {
      isLoading.value = false;
    }
  }

  // Watch for changes in isLoading and add the assistant's message to conversation history when loading ends
  watch(isLoading, (newValue, oldValue) => {
    if (
      oldValue === true &&
      newValue === false &&
      currentAssistantMessage.value
    ) {
      conversationHistory.value.push({
        role: "assistant",
        content: currentAssistantMessage.value,
      });
      currentAssistantMessage.value = "";
    }
  });

  return {
    chatWithBookmarks,
    isLoading,
    currentAssistantMessage,
    conversationHistory,
    tokenUsage,
    errorMessage,
  };
}
