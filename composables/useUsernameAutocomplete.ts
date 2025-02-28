import { ref, computed, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import type { Tweet, User as TweetUser } from "~/types";

export interface User {
  handle: string;
  name: string;
  profilePicUrl?: string;
  frequency: number; // How many times this user appears in bookmarks
}

export function useUsernameAutocomplete(
  bookmarks: Ref<Tweet[] | null>,
  searchQuery: Ref<string>
) {
  // State
  const isShowingSuggestions = ref(false);
  const userSuggestionQuery = ref("");
  const cursorPosition = ref(0);
  const preventSuggestions = ref(false);

  // Extract unique users from bookmarks
  const uniqueUsers = computed(() => {
    if (!bookmarks.value) return [];

    const userMap = new Map<string, User>();

    bookmarks.value.forEach((tweet) => {
      if (tweet.user) {
        const handle = tweet.user.handle;
        if (handle && !userMap.has(handle)) {
          userMap.set(handle, {
            handle,
            name: tweet.user.name || "",
            profilePicUrl: tweet.user.profilePicUrl,
            frequency: 1,
          });
        } else if (handle) {
          // Increment frequency counter
          const user = userMap.get(handle);
          if (user) {
            user.frequency++;
          }
        }
      }
    });

    // Convert map to array and sort by frequency (most frequent first)
    return Array.from(userMap.values()).sort(
      (a, b) => b.frequency - a.frequency
    );
  });

  // Check if cursor is in a "from:" context
  const isInFromContext = computed(() => {
    if (preventSuggestions.value) return false;

    if (!searchQuery.value) return false;

    const query = searchQuery.value;
    const pos = cursorPosition.value;

    // Find the last "from:" before cursor position
    const fromIndex = query.lastIndexOf("from:", pos);
    if (fromIndex === -1) return false;

    // If cursor is right after "from:", show suggestions immediately
    if (fromIndex + 5 === pos) return true;

    // Check if there's a space after "from:" and before cursor
    const afterFrom = query.substring(fromIndex + 5, pos);

    // If we're in a quoted context, check if the quote is closed
    if (afterFrom.startsWith('"')) {
      const endQuotePos = afterFrom.indexOf('"', 1);
      // If no end quote or end quote is after cursor, we're in a from context
      return endQuotePos === -1 || endQuotePos + fromIndex + 6 >= pos;
    }

    // If not in quotes, check if we're still in the same word
    const nextSpacePos = query.indexOf(" ", fromIndex + 5);
    return nextSpacePos === -1 || nextSpacePos >= pos;
  });

  // Extract the current username being typed
  const currentUsername = computed(() => {
    if (!isInFromContext.value) return "";

    const query = searchQuery.value;
    const pos = cursorPosition.value;

    // Find the last "from:" before cursor position
    const fromIndex = query.lastIndexOf("from:", pos);

    // If cursor is right after "from:", return empty string to show all suggestions
    if (fromIndex + 5 === pos) return "";

    // Extract text between "from:" and cursor position
    let username = query.substring(fromIndex + 5, pos).trim();

    // Remove quotes if present
    if (username.startsWith('"')) {
      username = username.substring(1);
    }

    return username;
  });

  // Update suggestion state when typing
  const updateSuggestionState = useDebounceFn(() => {
    isShowingSuggestions.value = isInFromContext.value;
    userSuggestionQuery.value = currentUsername.value;
  }, 200); // 200ms debounce

  // Watch for changes in search query or cursor position
  watch([searchQuery, cursorPosition], updateSuggestionState);

  // Handle selecting a username suggestion
  function selectUsername(user: User) {
    if (!searchQuery.value) return;

    const query = searchQuery.value;
    const pos = cursorPosition.value;

    // Find the last "from:" before cursor position
    const fromIndex = query.lastIndexOf("from:", pos);
    if (fromIndex === -1) return;

    // Determine if we need quotes (if username has spaces)
    const needsQuotes = user.handle.includes(" ");
    const username = needsQuotes ? `"${user.handle}"` : user.handle;

    // Check if we're already in a quoted context
    const afterFrom = query.substring(fromIndex + 5, pos).trim();
    const inQuotes = afterFrom.startsWith('"');

    // Build the new query
    let newQuery;
    let newPosition;

    if (inQuotes) {
      // Replace everything between from: and the cursor or next quote
      const endQuotePos = query.indexOf('"', fromIndex + 6);
      if (endQuotePos !== -1 && endQuotePos < pos) {
        // Quote is closed before cursor, replace the whole quoted string
        newQuery =
          query.substring(0, fromIndex + 5) +
          username +
          " " +
          query.substring(endQuotePos + 1);
        newPosition = fromIndex + 5 + username.length + 1; // +1 for the space
      } else {
        // Find the next space after cursor or end of string
        const nextSpacePos = query.indexOf(" ", pos);
        const replaceEnd = nextSpacePos !== -1 ? nextSpacePos : query.length;
        newQuery =
          query.substring(0, fromIndex + 5) +
          username +
          " " +
          query.substring(replaceEnd);
        newPosition = fromIndex + 5 + username.length + 1; // +1 for the space
      }
    } else {
      // Find the next space after from: or end of string
      const nextSpacePos = query.indexOf(" ", fromIndex + 5);
      const replaceEnd = nextSpacePos !== -1 ? nextSpacePos : query.length;
      newQuery =
        query.substring(0, fromIndex + 5) +
        username +
        " " +
        query.substring(replaceEnd);
      newPosition = fromIndex + 5 + username.length + 1; // +1 for the space
    }

    // Update the search query and cursor position
    searchQuery.value = newQuery;

    // Hide suggestions and prevent them from showing immediately
    isShowingSuggestions.value = false;
    preventSuggestions.value = true;

    // Reset the prevention after a short delay
    setTimeout(() => {
      preventSuggestions.value = false;
    }, 300);

    // Return the new cursor position for the input to set
    return newPosition;
  }

  // Hide suggestions
  function hideSuggestions() {
    isShowingSuggestions.value = false;
  }

  return {
    isShowingSuggestions,
    userSuggestionQuery,
    uniqueUsers,
    cursorPosition,
    selectUsername,
    hideSuggestions,
  };
}
