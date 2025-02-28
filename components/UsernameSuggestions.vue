<template>
  <Transition name="fade">
    <div
      v-if="visible && suggestions.length > 0"
      class="absolute z-10 mt-1 w-full max-w-[440px] bg-white rounded-md shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto"
    >
      <ul class="py-1">
        <li
          v-for="(suggestion, index) in suggestions"
          :key="suggestion.handle"
          @click="selectSuggestion(suggestion)"
          @mouseenter="activeIndex = index"
          :class="[
            'px-4 py-2 cursor-pointer flex items-center hover:bg-gray-100',
            activeIndex === index ? 'bg-gray-100' : '',
          ]"
        >
          <div class="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden mr-2">
            <img
              v-if="suggestion.profilePicUrl"
              :src="suggestion.profilePicUrl"
              :alt="suggestion.name"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600"
            >
              {{ suggestion.name.charAt(0) }}
            </div>
          </div>
          <div>
            <div class="font-medium">{{ suggestion.name }}</div>
            <div class="text-sm text-gray-500">@{{ suggestion.handle }}</div>
          </div>
        </li>
      </ul>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import type { User } from "~/composables/useUsernameAutocomplete";

const props = defineProps<{
  query: string;
  visible: boolean;
  users: User[];
}>();

const emit = defineEmits<{
  (e: "select", value: User): void;
  (e: "keydown", event: KeyboardEvent): void;
}>();

const activeIndex = ref(0);
const suggestions = computed(() => {
  // If not visible, return empty array
  if (!props.visible) return [];

  // If query is empty (right after typing "from:"), show all users (limited to 7)
  if (!props.query) {
    return props.users.slice(0, 7);
  }

  // Otherwise filter by the query
  const searchTerm = props.query.toLowerCase();
  return props.users
    .filter(
      (user) =>
        user.handle.toLowerCase().includes(searchTerm) ||
        user.name.toLowerCase().includes(searchTerm)
    )
    .slice(0, 7); // Limit to 7 suggestions
});

// Reset active index when suggestions change
watch(suggestions, () => {
  activeIndex.value = 0;
});

function selectSuggestion(suggestion: User) {
  emit("select", suggestion);
}

// Handle keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  if (!props.visible || suggestions.value.length === 0) return;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      activeIndex.value = (activeIndex.value + 1) % suggestions.value.length;
      break;
    case "ArrowUp":
      event.preventDefault();
      activeIndex.value =
        (activeIndex.value - 1 + suggestions.value.length) %
        suggestions.value.length;
      break;
    case "Enter":
      event.preventDefault();
      if (suggestions.value[activeIndex.value]) {
        selectSuggestion(suggestions.value[activeIndex.value]);
      }
      break;
    case "Escape":
      event.preventDefault();
      emit("keydown", event);
      break;
    default:
      emit("keydown", event);
  }
}

// Register and unregister keyboard event listeners
onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
