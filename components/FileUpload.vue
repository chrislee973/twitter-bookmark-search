<template>
  <div class="w-full">
    <div
      ref="dropzoneEl"
      class="relative bg-gray-200 p-3 text-center flex items-center gap-x-2 justify-center rounded-xl h-40 w-full"
      :class="{
        border: isOverDropZone,
        'border-[#5daefe] border-1': isOverDropZone,
      }"
    >
      <Icon name="radix-icons:upload" class="w-5 h-5" />
      <div>Upload your bookmarks file here</div>
      <input
        type="file"
        accept=".json"
        @input="onFileChange"
        class="absolute inset-0 opacity-0"
        @dragover="isOverDropZone = true"
        @dragleave="isOverDropZone = false"
      />
    </div>
    <div
      v-if="isValidJsonSchema === false"
      class="text-red-500 font-semibold text-sm"
    >
      <Icon name="radix-icons:cross-2" /> Invalid JSON schema. Please follow
      setup steps to re-export your bookmarks.
    </div>
    <div v-else-if="bookmarks && isValidJsonSchema" class="italic text-sm">
      <Icon name="radix-icons:check-circled" class="text-green-500" />
      {{ uploadFileName }}
    </div>
    <ClientOnly>
      <div class="mt-2 flex gap-2 items-start">
        <Switch v-model:checked="isUseLocalStorage" />
        <div>
          <div class="leading-none">Save to browser storage</div>
          <div class="text-xs text-muted-foreground">
            Saving to browser storage means you don't have to reupload your
            bookmarks file every time you visit this site.
          </div>
          <!-- Show storage error if IndexedDB fails -->
          <div v-if="storageError" class="text-xs text-red-500 mt-1">
            <Icon name="radix-icons:exclamation-triangle" class="inline" />
            {{ storageError }}
          </div>
          <!-- Show file size info for context -->
          <div v-if="fileSizeInfo" class="text-xs text-muted-foreground mt-1">
            File size: {{ fileSizeInfo }}
          </div>
        </div>
      </div>
    </ClientOnly>
    <Button
      @click="startSearching"
      :disabled="!bookmarks || !isValidJsonSchema"
      class="mt-4 sm:mt-8 w-full"
      >Start searching</Button
    >
  </div>
</template>

<script setup lang="ts">
// ============================================================
// IndexedDB Integration Notes:
// ============================================================
// The save-to-storage logic is now handled reactively in useBookmarks.ts
// When isUseLocalStorage is true and bookmarks changes, it auto-saves to IndexedDB
// This simplifies this component - we just set the data and navigate
//
// Key differences from the old localStorage approach:
// 1. No manual save call needed - the watcher in useBookmarks handles it
// 2. storageError will be set if IndexedDB fails (e.g., private browsing)
// 3. File size is no longer a concern - IndexedDB handles 50MB+ easily
// ============================================================

import {
  bookmarks,
  isUseLocalStorage,
  storageError,
} from "~/composables/state";
import { Switch } from "@/components/ui/switch";

import type { Tweet } from "~/types";

const dropzoneEl = ref();
const isOverDropZone = ref(false);

const isValidJsonSchema = ref<Boolean | null>(null);

const uploadFileName = ref<string | null>(null);
const fileSizeInfo = ref<string | null>(null);

// Format bytes into human-readable string
function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " bytes";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

async function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    // parse the file as json and assign it to the bookmarks ref
    const file = target.files[0];
    uploadFileName.value = file.name;
    fileSizeInfo.value = formatBytes(file.size);

    const reader = new FileReader();
    reader.onload = () => {
      // validate the objects in the uploaded file against the Tweet type
      try {
        const data = JSON.parse(reader.result as string);
        const version = data?.version;
        if (!version && version <= 1) {
          throw new Error("Invalid version");
        }
        // Setting bookmarks.value triggers the watcher in useBookmarks.ts
        // If isUseLocalStorage is true, it will automatically save to IndexedDB
        bookmarks.value = data.data;
        isValidJsonSchema.value = true;
      } catch (e) {
        console.error(e);
        isValidJsonSchema.value = false;
      }
    };
    reader.readAsText(file);
  }
}

function startSearching() {
  // Navigation is simple now - the save logic is handled by the watcher
  // in useBookmarks.ts when isUseLocalStorage is true
  navigateTo("/search");
}

// ============================================================
// Clear IndexedDB when user disables storage
// ============================================================
// This is still handled by the watcher in useBookmarks.ts
// When isUseLocalStorage becomes false, it clears storedBookmarks
</script>
