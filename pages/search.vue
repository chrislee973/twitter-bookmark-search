<template>
  <div v-if="bookmarks" class="mt-12 w-full max-w-none">
    <div class="relative w-[440px] mx-auto">
      <input
        type="text"
        placeholder="Search"
        v-model.trim="searchQuery"
        @input="handleInput"
        @keydown="handleKeydown"
        @click="handleClick"
        @blur="handleBlur"
        ref="searchInputRef"
        autofocus
        class="px-4 py-2 rounded-3xl focus:border border-none focus:outline-none focus:ring-1 focus:ring-blue-twitter placeholder:text-muted-foreground focus:bg-white w-full h-[45px] bg-[#eff3f4] block"
      />
      <UsernameSuggestions
        :query="userSuggestionQuery"
        :visible="isShowingSuggestions"
        :users="uniqueUsers"
        @select="handleUserSelect"
        @keydown="handleSuggestionKeydown"
      />
    </div>
    <div v-if="searchResults" class="mt-9">
      <div class="text-center mb-2">
        Found {{ searchResults.length }} results for
        <span class="italic">{{ displayQuery }}</span>
        <SortDropdown v-model="sortBy" />
      </div>
      <div id="searchResults" class="mb-4">
        <SearchResult
          class="border border-gray-200 border-b-0 last:border-b-2"
          v-for="result in displayedSearchResults"
          :result="result"
          :search-query="displayQuery"
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
import type { Tweet } from "~/types";
import { computed, ref, onMounted, watch, nextTick } from "vue";
import {
  useUsernameAutocomplete,
  type User,
} from "~/composables/useUsernameAutocomplete";
import {
  useSearchSorting,
  type SortOption,
} from "~/composables/useSearchSorting";
import SortDropdown from "~/components/SortDropdown.vue";

definePageMeta({
  noRedirect: true,
});

const searchQuery = ref("");
const searchInputRef = ref<HTMLInputElement | null>(null);

const searchResults = ref<FuseResult<Tweet>[] | null>(null);

// Use the search sorting composable
const { sortBy, sortedResults } = useSearchSorting(searchResults);

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
} = useInfiniteScroller(sortedResults, {
  initialItems: 10,
  increment: 10,
});

// Username autocomplete integration
const {
  isShowingSuggestions,
  userSuggestionQuery,
  uniqueUsers,
  cursorPosition,
  selectUsername,
  hideSuggestions,
} = useUsernameAutocomplete(bookmarks, searchQuery);

// Handle input events to track cursor position
function handleInput(event: Event) {
  if (searchInputRef.value) {
    cursorPosition.value = searchInputRef.value.selectionStart || 0;
  }
}

// Handle click events to track cursor position
function handleClick(event: MouseEvent) {
  if (searchInputRef.value) {
    cursorPosition.value = searchInputRef.value.selectionStart || 0;
  }
}

// Handle keydown events
function handleKeydown(event: KeyboardEvent) {
  // Update cursor position on keydown
  if (searchInputRef.value) {
    cursorPosition.value = searchInputRef.value.selectionStart || 0;
  }

  // Hide suggestions on Escape
  if (event.key === "Escape") {
    hideSuggestions();
  }
}

// Handle suggestion keydown events
function handleSuggestionKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    hideSuggestions();
    // Focus back on the input
    searchInputRef.value?.focus();
  }
}

// Handle blur events
function handleBlur(event: FocusEvent) {
  // Don't hide suggestions immediately to allow clicking on them
  setTimeout(() => {
    hideSuggestions();
  }, 200);
}

// Handle user selection
function handleUserSelect(user: User) {
  // Get the new cursor position after inserting the username
  const newPosition = selectUsername(user);

  // Focus back on the input and set cursor position
  setTimeout(() => {
    if (searchInputRef.value) {
      searchInputRef.value.focus();
      if (newPosition) {
        searchInputRef.value.selectionStart = newPosition;
        searchInputRef.value.selectionEnd = newPosition;
      }
    }
  }, 0);
}

// Watch for changes in searchQuery to update cursor position
// This helps when typing "from:" to immediately show suggestions
watch(searchQuery, () => {
  // Use nextTick to ensure the DOM has updated
  nextTick(() => {
    if (searchInputRef.value) {
      // Get current cursor position
      const currentPos = searchInputRef.value.selectionStart || 0;

      // Check if we just typed "from:"
      const query = searchQuery.value;
      if (query.endsWith("from:") && currentPos === query.length) {
        // Update cursor position
        cursorPosition.value = currentPos;
      }
    }
  });
});

const isExactMatch = computed(() => {
  const { remainingQuery } = parseSearchQuery(searchQuery.value.trim());
  return remainingQuery.startsWith('"') && remainingQuery.endsWith('"');
});

interface ParsedSearchQuery {
  fromUser?: string;
  remainingQuery: string;
}

function parseSearchQuery(query: string): ParsedSearchQuery {
  /**
   * Parses a search query string to extract user filter and remaining search terms
   * @param query The search query string to parse
   * @returns {ParsedSearchQuery} Object containing optional fromUser filter and remaining search query
   * @example
   * // Returns { fromUser: "john", remainingQuery: "hello world" }
   * parseSearchQuery('from:john hello world')
   *
   * // Returns { fromUser: "john doe", remainingQuery: "search terms" }
   * parseSearchQuery('from:"john doe" search terms')
   *
   * // Returns { remainingQuery: "just search" }
   * parseSearchQuery('just search')
   */
  const fromRegex = /\bfrom:(?:"([^"]+)"|(\S+))/i;
  const match = query.match(fromRegex);

  if (!match) {
    return { remainingQuery: query };
  }

  const username = match[1] || match[2]; // Get the captured username from either quoted or unquoted group
  const remainingQuery = query.replace(match[0], "").trim();

  return {
    fromUser: username,
    remainingQuery,
  };
}

// Add a computed property for the parsed search
const parsedSearchQuery = computed(() =>
  parseSearchQuery(searchQuery.value.trim())
);

// Add a computed property for the display query
const displayQuery = computed(() => {
  const { fromUser, remainingQuery } = parsedSearchQuery.value;

  // If we only have a fromUser and no remainingQuery, show a user-friendly message
  if (fromUser && !remainingQuery) {
    return `all bookmarks from ${fromUser}`;
  }

  return isExactMatch.value ? remainingQuery.slice(1, -1) : remainingQuery;
});

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
      keys: ["text", "user.name", "user.handle"],
      // sortFn: (a, b) => {
      //   return (
      //     new Date(b.item.date).getTime() - new Date(a.item.date).getTime()
      //   );
      // },
    });
  }
});

// Helper functions for search filtering
function filterByUser(results: FuseResult<Tweet>[], username: string) {
  const searchUser = username.toLowerCase();
  return results.filter((result) => {
    const handle = result.item.user?.handle?.toLowerCase();
    const name = result.item.user?.name?.toLowerCase();

    // Use exact match for handle, but allow partial match for name
    return (
      handle === searchUser ||
      (name &&
        name
          .split(" ")
          .some((namePart) => namePart.toLowerCase() === searchUser))
    );
  });
}

function filterByExactMatch(results: FuseResult<Tweet>[], query: string) {
  const regex = new RegExp(`\\b${escapeRegexSpecialCharacters(query)}\\b`, "i");
  return results.filter((result) =>
    ["text", "user.name", "user.handle"].some((key) => {
      const fieldValue = result.item[key as keyof Tweet];
      return fieldValue && regex.test(fieldValue as string);
    })
  );
}

function performSearch(query: string, fromUser: string | undefined) {
  if (!fuse) {
    return null;
  }

  // If we have a fromUser but no query, we want to show all tweets from that user
  if (!query && fromUser) {
    // Get all bookmarks and filter by user with exact match
    const searchUser = fromUser.toLowerCase();
    return bookmarks.value
      ? bookmarks.value
          .filter((tweet) => {
            const handle = tweet.user?.handle?.toLowerCase();
            const name = tweet.user?.name?.toLowerCase();

            // Use exact match for handle, but allow partial match for name
            return (
              handle === searchUser ||
              (name &&
                name
                  .split(" ")
                  .some((namePart) => namePart.toLowerCase() === searchUser))
            );
          })
          .map((item) => ({ item, score: 0, refIndex: 0 }))
      : [];
  }

  // If no query and no fromUser, return null (no search)
  if (!query && !fromUser) {
    return null;
  }

  let results: FuseResult<Tweet>[];

  if (isExactMatch.value) {
    const unquotedQuery = query.slice(1, -1);
    results = fuse.search(unquotedQuery);
    results = filterByExactMatch(results, unquotedQuery);
  } else {
    results = fuse.search(query);
  }

  if (fromUser) {
    results = filterByUser(results, fromUser);
  }

  return results;
}

watch(searchQuery, () => {
  if (!fuse) {
    // we don't check if the query is empty for cases where there's a from: operator used and the query is empty. In these cases we want to show all bookmarks from the selected user
    searchResults.value = null;
    return;
  }

  const { fromUser, remainingQuery } = parsedSearchQuery.value;

  // If searchQuery is empty and no fromUser, clear results
  if (!searchQuery.value && !fromUser) {
    searchResults.value = null;
    return;
  }

  searchResults.value = performSearch(remainingQuery, fromUser);
});

function escapeRegexSpecialCharacters(string: string) {
  // This is a helper function to escape special characters in a string
  // so that they are treated as literal characters in a regex
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
</script>
