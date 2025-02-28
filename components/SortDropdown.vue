<template>
  <div class="flex items-center justify-center gap-2 mt-1 text-sm">
    <span>Sort by:</span>
    <div class="relative inline-block" ref="dropdownRef">
      <button
        @click="isOpen = !isOpen"
        class="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 border border-gray-200"
      >
        {{ SORT_OPTIONS[modelValue] }}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        v-if="isOpen"
        class="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
      >
        <div class="py-1" role="menu" aria-orientation="vertical">
          <button
            v-for="(label, value) in SORT_OPTIONS"
            :key="value"
            @click="selectOption(value)"
            class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            :class="{ 'bg-gray-50': modelValue === value }"
          >
            {{ label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { SORT_OPTIONS, type SortOption } from "~/composables/useSearchSorting";

// Define props with modelValue for v-model support
const props = defineProps<{
  modelValue: SortOption;
}>();

// Define emits for v-model support
const emit = defineEmits<{
  (e: "update:modelValue", value: SortOption): void;
}>();

// Use the shared sort options
// const sortOptions = SORT_OPTIONS;

// Dropdown state
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

// Select option and close dropdown
function selectOption(value: string) {
  emit("update:modelValue", value as SortOption);
  isOpen.value = false;
}

// Handle clicks outside the dropdown to close it
onMounted(() => {
  // Using VueUse's useEventListener for automatic cleanup
  useEventListener(document, "click", (event: MouseEvent) => {
    const target = event.target as Element;
    if (
      isOpen.value &&
      dropdownRef.value &&
      !dropdownRef.value.contains(target)
    ) {
      isOpen.value = false;
    }
  });
});
</script>
