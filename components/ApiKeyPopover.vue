<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger>
      <Button variant="link" class="p-0 h-auto font-normal"
        ><slot></slot
      ></Button>
    </PopoverTrigger>
    <PopoverContent class="w-80">
      <div class="grid gap-4">
        <h4 class="font-medium leading-none">
          Save
          {{ props.provider === "openai" ? "OpenAI" : "Google Gemini" }} API Key
        </h4>
        <Input v-model="apiKeyUserInput" placeholder="Enter API key..." />
        <Button @click="saveApiKey">Save API Key</Button>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup>
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLLMKeys } from "@/composables/useLLMKeys";

const props = defineProps({
  provider: {
    type: String,
    required: true,
  },
});

const { openai: openaiApiKey, gemini: geminiApiKey } = useLLMKeys();

const apiKeyUserInput = ref("");
const isOpen = ref(false);

const saveApiKey = () => {
  if (props.provider === "openai") {
    openaiApiKey.value = apiKeyUserInput.value;
  } else {
    geminiApiKey.value = apiKeyUserInput.value;
  }
  isOpen.value = false;
};

watch(isOpen, (newVal) => {
  if (newVal) {
    apiKeyUserInput.value =
      props.provider === "openai" ? openaiApiKey.value : geminiApiKey.value;
  }
});
</script>
