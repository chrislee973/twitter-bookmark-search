import type { FuseResult } from "fuse.js";
import type { Tweet } from "~/types";

// Define sort options as a constant that can be reused
export const SORT_OPTIONS = {
  relevance: "Relevance",
  newestFirst: "Newest to oldest",
  oldestFirst: "Oldest to newest",
} as const;

// Define type for sort option keys
export type SortOption = keyof typeof SORT_OPTIONS;

export function useSearchSorting(
  searchResults: Ref<FuseResult<Tweet>[] | null>
) {
  // Current sort option
  const sortBy = ref<SortOption>("relevance");

  // Apply sorting to search results
  const sortedResults = computed(() => {
    if (!searchResults.value) return null;

    // Create a copy to avoid mutating the original
    const results = [...searchResults.value];

    switch (sortBy.value) {
      case "relevance":
        // Keep original order (already sorted by relevance)
        return results;

      case "oldestFirst":
        // Sort by date (oldest first)
        return results.sort(
          (a, b) =>
            new Date(a.item.date).getTime() - new Date(b.item.date).getTime()
        );

      case "newestFirst":
        // Sort by date (newest first)
        return results.sort(
          (a, b) =>
            new Date(b.item.date).getTime() - new Date(a.item.date).getTime()
        );

      default:
        return results;
    }
  });

  return {
    sortBy,
    sortedResults,
    sortOptions: SORT_OPTIONS,
  };
}
