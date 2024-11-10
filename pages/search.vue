<template>
  <div v-if="bookmarks" class="mt-12">
    <input
      type="text"
      placeholder="Search"
      v-model.trim="searchQuery"
      autofocus
      class="px-4 py-2 rounded-3xl focus:border border-none focus:outline-none focus:ring-1 focus:ring-blue-twitter placeholder:text-muted-foreground focus:bg-white w-[440px] h-[45px] mx-auto bg-[#eff3f4] block"
    />
    <div v-if="searchResults" class="mt-9">
      <div class="text-center mb-2">
        Found {{ searchResults.length }} results for
        <span class="italic">{{ searchQuery }}</span>
      </div>
      <div id="searchResults" class="mb-4">
        <SearchResult
          class="border border-gray-200 border-b-0 last:border-b-2"
          v-for="result in searchResultsToDisplay"
          :result="result"
          :search-query="searchQuery"
          :key="result.item.url"
        />
      </div>
      <div
        class="flex gap-x-5 w-fit mx-auto"
        v-if="searchResults && searchResultsToDisplay"
      >
        <Button
          v-if="searchResults.length > searchResultsToDisplay.length"
          class="bg-blue-twitter hover:bg-blue-twitter/90 text-white"
          @click="showMoreResults"
          >Show more results</Button
        >
        <div v-else class="italic">No more results</div>
      </div>
    </div>
    <BookmarkStats v-else class="mt-8" />
  </div>
  <div v-else class="mt-12 relative border-dashed border rounded-md h-[450px]">
    <div class="absolute inset-0 m-auto h-fit w-fit text-center">
      <div class="font-semibolt text-lg">No bookmarks file detected</div>
      <div class="text-sm text-muted-foreground mt-2">
        Follow the steps in
        <NuxtLink to="/" class="underline">the instructions </NuxtLink>
        and upload your bookmarks file.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Fuse from "fuse.js";
import { type FuseResult } from "fuse.js";
import { bookmarks } from "~/composables/state";
import { useLocalStorage } from "@vueuse/core";
import { StorageSerializers, useStorage } from "@vueuse/core";
import { Button } from "@/components/ui/button";
import type { Tweet } from "~/types";

definePageMeta({
  noRedirect: true,
});

const searchQuery = ref("");

const searchResults = ref<FuseResult<Tweet>[] | null>(null);
const searchResultsToDisplay = ref<FuseResult<Tweet>[] | null>(null);

const localBookmarks = useLocalStorage<Tweet[]>("twitter-bookmarks", null, {
  serializer: StorageSerializers.object,
}); // By default, useStorage will use the value from storage if it is present and ignores the default value.
if (localBookmarks.value) {
  bookmarks.value = localBookmarks.value;
}

let fuse: Fuse<Tweet> | null = null;
watchEffect(() => {
  if (bookmarks.value) {
    fuse = new Fuse(bookmarks.value, {
      includeMatches: true,
      threshold: 0.0,
      useExtendedSearch: true,
      ignoreLocation: true,
      ignoreFieldNorm: false,
      includeScore: true,
      // keys: ["text"],
      keys: ["text", "user.name", "user.handle"],
    });
  }
});

watch(searchQuery, () => {
  // the below will reinitialize searchResults and searchResultsToDisplay, since searchResultsToDisplay is initialized to first 10 elements of searchResults
  // this way, we don't need to explicitly reinit these two by setting them to null the way we do in youtube-podcast-search
  searchResults.value =
    searchQuery.value && fuse ? fuse.search(`"${searchQuery.value}"`) : null;
  if (searchResults.value) {
    searchResultsToDisplay.value = searchResults.value.slice(0, 10);
  }
});

function showMoreResults() {
  const numCurrentlyShowingResults = searchResultsToDisplay.value?.length;
  if (searchResults.value && numCurrentlyShowingResults) {
    searchResultsToDisplay.value = searchResults.value.slice(
      0,
      numCurrentlyShowingResults + 10
    );
  }
}
</script>
