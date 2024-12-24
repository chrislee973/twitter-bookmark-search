import { ref, computed } from "vue";
import { useIntersectionObserver } from "@vueuse/core";

interface UseInfiniteScrollOptions {
  initialItems?: number;
  increment?: number;
  delay?: number;
}

export function useInfiniteScroller<T>(
  items: Ref<T[] | null>,
  options: UseInfiniteScrollOptions = {}
) {
  const { initialItems = 15, increment = 15, delay = 300 } = options;

  const loadTrigger = ref(null);
  const numItemsToDisplay = ref(initialItems);
  const loading = ref(false);

  const displayedItems = computed(() => {
    if (!items.value) return [];
    return items.value.slice(0, numItemsToDisplay.value);
  });

  const { stop } = useIntersectionObserver(
    loadTrigger,
    ([entry]) => {
      if (entry.isIntersecting) {
        loadMore();
      }
    },
    { threshold: 0.1 }
  );

  async function loadMore() {
    if (loading.value) return;
    if (!items.value) return;

    const totalItems = items.value.length;
    if (numItemsToDisplay.value >= totalItems) return;

    loading.value = true;
    await new Promise((resolve) => setTimeout(resolve, delay));
    numItemsToDisplay.value += increment;
    loading.value = false;
  }

  return {
    loadTrigger,
    loading,
    displayedItems,
    loadMore,
  };
}
