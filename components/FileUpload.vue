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
import { bookmarks, isUseLocalStorage } from "~/composables/state";
import { Switch } from "@/components/ui/switch";
import { useLocalStorage } from "@vueuse/core";

import type { Tweet } from "~/types";

const dropzoneEl = ref();
const isOverDropZone = ref(false);

const isValidJsonSchema = ref<Boolean | null>(null);
// function validateJsonSchema() {
//   if (bookmarks.value) {
//     // validate it against Tweet type
//     isValidJsonSchema.value = bookmarks.value.every((bookmark: Tweet) => {
//       return (
//         bookmark.id &&
//         bookmark.date &&
//         bookmark.text &&
//         bookmark.url &&
//         bookmark.user &&
//         bookmark.media
//       );
//     });
//   }
// }

const uploadFileName = ref<string | null>(null);
async function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    // parse the file as json and assign it to the bookmarks ref
    const file = target.files[0];
    uploadFileName.value = file.name;
    const filename = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      // validate the objects in the uploaded file against the Tweet type
      try {
        const data = JSON.parse(reader.result as string);
        const version = data?.version;
        if (!version && version <= 1) {
          throw new Error("Invalid version");
        }
        bookmarks.value = data.data;
        isValidJsonSchema.value = true;
      } catch (e) {
        console.error(e);
        isValidJsonSchema.value = false;
      }

      // bookmarks.value = JSON.parse(reader.result as string);

      // if localstorage contained an old copy of bookmarks, update with the new one they just uploaded
      // if (isUseLocalStorage.value === true) {
      //   // localStorage.setItem(
      //   //   "twitter-bookmarks",
      //   //   JSON.stringify(bookmarks.value)
      //   // );
      //   useLocalStorage("twitter-bookmarks", bookmarks.value);
      // }
      // navigateTo("/search");
    };
    reader.readAsText(file);
  }
}

function startSearching() {
  // if isUseLocalStorage is set by the user to true, save the bookmarks to localstorage
  if (isUseLocalStorage.value && bookmarks.value) {
    const localBookmarks = useLocalStorage(
      "twitter-bookmarks",
      bookmarks.value
    );
    localBookmarks.value = bookmarks.value;
  }

  navigateTo("/search");
}

watchEffect(() => {
  // if isUseLocalStorage is set by the user to false, delete the bookmarks from localstorage
  if (isUseLocalStorage.value === false) {
    const bookmarksLocalStorage = useLocalStorage("twitter-bookmarks", null);
    if (bookmarksLocalStorage.value) {
      bookmarksLocalStorage.value = null;
    }
  }
});

// watchEffect(() => {
//   if (isUseLocalStorage.value === true && bookmarks.value) {
//     // localStorage.setItem("twitter-bookmarks", JSON.stringify(bookmarks.value));
//     useLocalStorage("twitter-bookmarks", bookmarks.value);
//   } else {
//     // localStorage.removeItem("twitter-bookmarks");
//     useLocalStorage("twitter-bookmarks", null);
//   }
// });
</script>
