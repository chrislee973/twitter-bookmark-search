<template>
  <div class="mt-8 max-w-2xl mx-auto">
    <div class="mb-4">
      <div
        v-for="(message, index) in conversationHistory"
        :key="index"
        class="mb-4 flex"
        :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div class="max-w-[70%]">
          <span
            class="inline-block px-4 py-2 rounded-lg text-left"
            :class="
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 prose'
            "
          >
            <div v-html="renderMarkdown(message.content)"></div>
          </span>
        </div>
      </div>
      <div v-if="currentAssistantMessage" class="mb-4 flex justify-start">
        <div class="max-w-[70%]">
          <span
            class="inline-block px-4 py-2 rounded-lg bg-gray-200 text-gray-800 text-left prose"
          >
            <div v-html="renderMarkdown(currentAssistantMessage)"></div>
          </span>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="mb-4">
      <input
        v-model="userInput"
        type="text"
        placeholder="Ask about your bookmarks..."
        class="w-full p-2 border border-gray-300 rounded"
        :disabled="isLoading"
      />
      <button
        type="submit"
        class="mt-2 px-4 py-2 bg-blue-twitter text-white rounded hover:bg-blue-400 transition flex items-center justify-center"
        :disabled="isLoading"
      >
        <template v-if="isLoading">
          <svg
            class="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </template>
        <span v-else>Ask</span>
      </button>
    </form>

    <div
      v-if="errorMessage"
      class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-start space-x-2"
    >
      <Icon name="heroicons:x-circle" class="w-6 h-6 text-red-500" />
      <span>Error: {{ errorMessage }}</span>
    </div>

    <div v-if="tokenUsage" class="mt-4 text-sm text-gray-600">
      <p>Total tokens used: {{ tokenUsage.totalTokens.toLocaleString() }}</p>
      <p>Prompt tokens: {{ tokenUsage.promptTokens.toLocaleString() }}</p>
      <p>
        Completion tokens: {{ tokenUsage.completionTokens.toLocaleString() }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useBookmarkChat } from "~/composables/useBookmarkChat";
import MarkdownIt from "markdown-it";

const props = defineProps({
  selectedLLMProvider: {
    type: String,
    required: true,
  },
});

const md = new MarkdownIt();
const {
  chatWithBookmarks,
  isLoading,
  currentAssistantMessage,
  conversationHistory,
  tokenUsage,
  errorMessage,
} = useBookmarkChat(toRef(() => props.selectedLLMProvider));
const userInput = ref("");

const handleSubmit = () => {
  if (userInput.value.trim()) {
    chatWithBookmarks(userInput.value);
    userInput.value = "";
  }
};

const renderMarkdown = (content) => {
  return md.render(content);
};
</script>

<style scoped>
.markdown-content {
  :deep(p) {
    margin: 0;
    padding: 0;
  }
  :deep(*:first-child) {
    margin-top: 0;
    padding-top: 0;
  }
  :deep(*:last-child) {
    margin-bottom: 0;
    padding-bottom: 0;
  }
}
</style>
