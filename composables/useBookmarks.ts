import type { Tweet, User } from "~/types";
import { useLocalStorage } from "@vueuse/core";
// useIDBKeyval is a VueUse composable that wraps IndexedDB in a reactive interface
// It uses idb-keyval under the hood, which provides a simple key-value API
// instead of IndexedDB's complex database/objectStore/transaction model
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";

export function useBookmarks() {
  const bookmarks = ref<Tweet[] | null>(null);

  // Track if we're currently loading from IndexedDB
  // IndexedDB is async (unlike localStorage), so we need to track loading state
  const isLoadingFromStorage = ref(true);

  // Track if there was an error saving to storage
  const storageError = ref<string | null>(null);

  const isUseLocalStorage = useLocalStorage(
    "twitter-bookmarks-uselocalstorage",
    false
  );

  // ============================================================
  // IndexedDB Setup with useIDBKeyval
  // ============================================================
  // useIDBKeyval creates a reactive ref that syncs with IndexedDB
  //
  // How IndexedDB works conceptually:
  // - Browser creates a database (default: "keyval-store")
  // - Inside that database is an "object store" (like a table)
  // - Each entry has a key (string) and value (any JS object)
  //
  // idb-keyval abstracts all of this into simple get/set operations
  // useIDBKeyval makes it reactive like Vue's ref()
  //
  // Key differences from localStorage:
  // 1. Async: All operations return Promises (hence isFinished, etc.)
  // 2. No serialization needed: Stores JS objects directly
  // 3. Much larger capacity: 50MB+ vs localStorage's 5MB
  // ============================================================
  const {
    data: storedBookmarks, // The reactive data (like ref.value)
    isFinished: isIDBReady, // True when initial load from IndexedDB completes
  } = useIDBKeyval<Tweet[] | null>(
    "twitter-bookmarks", // The key to store under (like localStorage key)
    null, // Default value if nothing stored
    {
      // shallow: true means we don't deeply watch nested changes
      // This improves performance for large arrays like bookmarks
      // We'll manually trigger saves when needed
      shallow: true,
      // onError callback handles IndexedDB errors (e.g., quota exceeded, private browsing)
      // Unlike localStorage which throws synchronously, IndexedDB errors come async
      onError: (error) => {
        console.error("[useBookmarks] IndexedDB error:", error);
        storageError.value =
          "Failed to access browser storage. Your bookmarks won't persist.";
      },
    }
  );

  // ============================================================
  // Migration: Move data from old localStorage to new IndexedDB
  // ============================================================
  // This runs once when the composable initializes
  // It checks if user has old localStorage data and migrates it
  const migrateFromLocalStorage = () => {
    // Only run on client side (IndexedDB doesn't exist on server)
    if (typeof window === "undefined") return;

    const oldData = localStorage.getItem("twitter-bookmarks");
    if (oldData && oldData !== "null") {
      try {
        const parsed = JSON.parse(oldData);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          console.log(
            `[useBookmarks] Migrating ${parsed.length} bookmarks from localStorage to IndexedDB`
          );
          // Set the data in IndexedDB
          storedBookmarks.value = parsed;
          // Clean up old localStorage data to free up space
          localStorage.removeItem("twitter-bookmarks");
        }
      } catch (e) {
        console.error("[useBookmarks] Failed to migrate from localStorage:", e);
      }
    }
  };

  // ============================================================
  // Initialize bookmarks from IndexedDB when it's ready
  // ============================================================
  // Because IndexedDB is async, we need to wait for it to load
  // This watch fires when isIDBReady becomes true
  watch(
    isIDBReady,
    (ready) => {
      if (ready) {
        // First, try to migrate any old localStorage data
        migrateFromLocalStorage();

        // Then load from IndexedDB if storage preference is enabled
        if (isUseLocalStorage.value && storedBookmarks.value) {
          bookmarks.value = storedBookmarks.value;
          console.log(
            `[useBookmarks] Loaded ${storedBookmarks.value.length} bookmarks from IndexedDB`
          );
        }
        isLoadingFromStorage.value = false;
      }
    },
    { immediate: true } // Run immediately in case IndexedDB is already ready
  );

  // ============================================================
  // Handle storage preference changes (toggle on/off)
  // ============================================================
  watch(isUseLocalStorage, (useStorage) => {
    if (useStorage && bookmarks.value) {
      // User enabled storage - save current bookmarks to IndexedDB
      storedBookmarks.value = bookmarks.value;
      storageError.value = null;
      console.log("[useBookmarks] Storage enabled, saving to IndexedDB");
    } else if (!useStorage) {
      // User disabled storage - clear IndexedDB
      storedBookmarks.value = null;
      storageError.value = null;
      console.log("[useBookmarks] Storage disabled, cleared IndexedDB");
    }
  });

  // ============================================================
  // Save to IndexedDB when bookmarks change (if storage enabled)
  // ============================================================
  watch(
    bookmarks,
    (newBookmarks) => {
      if (isUseLocalStorage.value && newBookmarks) {
        // Save to IndexedDB
        // Unlike localStorage, this won't throw QuotaExceededError for large data
        storedBookmarks.value = newBookmarks;
        console.log(
          `[useBookmarks] Saved ${newBookmarks.length} bookmarks to IndexedDB`
        );
      }
    },
    { deep: false } // Don't watch for deep changes, only when bookmarks ref itself changes
  );

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
    isLoadingFromStorage, // Show loading spinner while IndexedDB loads
    storageError, // Display error message if storage fails
  };
}
