import { useBookmarks } from "./useBookmarks";

export const {
  bookmarks,
  isUseLocalStorage,
  mostBookmarkedUsers,
  // New exports for IndexedDB
  isLoadingFromStorage, // True while loading from IndexedDB (it's async)
  storageError, // Error message if storage fails
} = useBookmarks();
