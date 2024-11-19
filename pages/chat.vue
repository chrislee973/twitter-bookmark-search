<template>
  <div v-if="bookmarks" class="mt-8">
    <h1 class="text-2xl font-bold mb-4 text-center">AI Chat</h1>
    <div class="max-w-2xl mx-auto text-center mb-4">
      Currently supported models are GPT-4o-mini and Gemini 1.5 Pro + Flash. You
      must provide your own API keys!
    </div>

    <div class="max-w-xs mx-auto mb-4">
      <div class="text-sm text-gray-500 mb-1">Select model provider:</div>
      <Select v-model="selectedLLMProvider">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Select model provider" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="openai">
            <div class="flex items-center">
              <Icon name="logos:openai-icon" class="mr-1.5" />
              <span>
                OpenAI
                <span class="text-xs text-gray-500">(gpt-4o-mini)</span>
              </span>
            </div>
          </SelectItem>
          <SelectItem value="geminiPro">
            <div class="flex items-center">
              <Icon
                name="simple-icons:googlegemini"
                class="mr-1.5 text-blue-400"
              />
              <span>
                Google Gemini
                <span class="text-xs text-gray-500"
                  >(gemini-1.5-pro-latest)</span
                >
              </span>
            </div>
          </SelectItem>
          <SelectItem value="geminiFlash">
            <div class="flex items-center">
              <Icon
                name="simple-icons:googlegemini"
                class="mr-1.5 text-blue-400"
              />
              <span>
                Google Gemini
                <span class="text-xs text-gray-500">(gemini-1.5-flash)</span>
              </span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="flex items-center justify-center gap-1 text-sm text-gray-500">
      <template
        v-if="
          selectedLLMProvider === 'openai' ? !!openaiApiKey : !!geminiApiKey
        "
      >
        <Icon class="text-green-500" name="carbon:checkmark-filled" />
        {{ selectedLLMProvider === "openai" ? "OpenAI" : "Gemini" }} api key
        found.
        <ApiKeyPopover :provider="selectedLLMProvider"
          ><span class="underline">Edit</span></ApiKeyPopover
        >
        your api key.
      </template>
      <template v-else>
        <Icon class="text-red-500" name="carbon:close-filled" />
        {{ selectedLLMProvider === "openai" ? "OpenAI" : "Gemini" }} api key not
        found.
        <ApiKeyPopover :provider="selectedLLMProvider"
          >Enter in your api key</ApiKeyPopover
        >
        to start chatting with your bookmarks.
      </template>
    </div>
    <div class="flex flex-col gap-8">
      <div class="w-full">
        <BookmarkChat :selectedLLMProvider="selectedLLMProvider" />
      </div>
    </div>
  </div>
  <div v-else class="mt-12 relative border-dashed border rounded-md h-[450px]">
    <div class="absolute inset-0 m-auto h-fit w-fit text-center">
      <div class="font-semibolt text-lg">No bookmarks file detected</div>
      <div class="text-sm text-muted-foreground mt-2">
        Follow the steps in
        <NuxtLink to="/" class="underline">the instructions</NuxtLink>
        and upload your bookmarks file.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bookmarks } from "~/composables/state";
import { useLLMKeys } from "@/composables/useLLMKeys";

const { openai: openaiApiKey, gemini: geminiApiKey } = useLLMKeys();

const selectedLLMProvider = ref("openai");
</script>
