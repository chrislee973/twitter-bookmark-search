import type { Tweet, User } from "~/types";
import { StorageSerializers, useLocalStorage } from "@vueuse/core";

export function useBookmarks() {
  const bookmarks = ref<Tweet[] | null>(null);

  const isUseLocalStorage = useLocalStorage(
    "twitter-bookmarks-uselocalstorage",
    false
  );

  // Initialize from localStorage if enabled
  const storedBookmarks = useLocalStorage<Tweet[] | null>(
    "twitter-bookmarks",
    null,
    {
      serializer: StorageSerializers.object,
    }
  );

  if (isUseLocalStorage.value && storedBookmarks.value) {
    bookmarks.value = storedBookmarks.value;
  }

  // Handle storage preference changes
  watch(isUseLocalStorage, (useStorage) => {
    if (useStorage && bookmarks.value) {
      storedBookmarks.value = bookmarks.value;
    } else {
      storedBookmarks.value = null;
    }
  });

  // Update storage when bookmarks change
  watch(bookmarks, (newBookmarks) => {
    if (isUseLocalStorage.value && newBookmarks) {
      storedBookmarks.value = newBookmarks;
    }
  });

  const mostBookmarkedUsers = computed(() => {
    if (!bookmarks.value) return;

    const usersToCounts = new Map<string, { user: User; count: number }>();

    bookmarks.value.forEach((bookmark) => {
      if (!bookmark.user) {
        console.error("Bookmark does not have a user: ", bookmark);
      }
      const userHandle = bookmark.user.handle;

      if (usersToCounts.has(userHandle)) {
        usersToCounts.get(userHandle)!.count++;
      } else {
        usersToCounts.set(userHandle, { user: bookmark.user, count: 1 });
      }
    });

    return Array.from(usersToCounts.values()).sort((a, b) => b.count - a.count);
  });

  return {
    bookmarks,
    isUseLocalStorage,
    mostBookmarkedUsers,
  };
}
