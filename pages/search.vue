<template>
  <div v-if="bookmarks" class="mt-12 w-full max-w-none">
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
          v-for="result in displayedSearchResults"
          :result="result"
          :search-query="searchQuery"
          :key="result.item.url"
        />
      </div>
      <div ref="searchLoadTrigger" class="h-10 mt-4"></div>
      <div v-if="searchLoading" class="text-center py-4">
        Loading more results...
      </div>
    </div>
    <div v-else>
      <BookmarkStats class="mt-8" />
      <div
        class="relative left-1/2 -translate-x-1/2 w-screen max-w-[1400px] px-4"
      >
        <div class="text-center text-xl font-bold mt-8">My bookmarks</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <a
            v-for="bookmark in displayedBookmarks"
            :key="bookmark.url"
            :href="bookmark.url"
            target="_blank"
            class="h-full"
          >
            <Tweet
              :tweet="bookmark"
              class="border border-gray-200 rounded-lg h-full"
            />
          </a>
        </div>
      </div>
      <div ref="loadTrigger" class="h-10 mt-4"></div>
      <div v-if="loading" class="text-center py-4">
        Loading more bookmarks...
      </div>
    </div>
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
import { Button } from "@/components/ui/button";
import type { Tweet } from "~/types";
import { useIntersectionObserver } from "@vueuse/core";

definePageMeta({
  noRedirect: true,
});

const searchQuery = ref("");

const searchResults = ref<FuseResult<Tweet>[] | null>(null);

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
  searchResults.value =
    searchQuery.value && fuse ? fuse.search(`"${searchQuery.value}"`) : null;
});

const {
  loadTrigger,
  loading,
  displayedItems: displayedBookmarks,
} = useInfiniteScroller(bookmarks, {
  initialItems: 10,
  increment: 10,
});

const {
  loadTrigger: searchLoadTrigger,
  loading: searchLoading,
  displayedItems: displayedSearchResults,
} = useInfiniteScroller(searchResults, {
  initialItems: 10,
  increment: 10,
});
</script>
