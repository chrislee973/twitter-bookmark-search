<template>
  <div class="mt-2 text-center">
    <button
      @click="showSearchTips = !showSearchTips"
      class="text-sm text-blue-twitter hover:underline flex items-center justify-center mx-auto"
    >
      <span>Search tips</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 ml-1"
        :class="
          showSearchTips
            ? 'rotate-180 transition-transform'
            : 'transition-transform'
        "
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

    <Transition name="fade">
      <div
        v-if="showSearchTips"
        class="mt-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200 text-left text-sm"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="font-medium">Filter by user</div>
            <div class="text-gray-600 mt-1">
              <code class="bg-gray-100 px-1.5 py-0.5 rounded"
                >from:username</code
              >
            </div>
            <div class="text-xs text-gray-500 mt-1">
              Shows tweets from specific users<br />
              Example:
              <code class="bg-gray-100 px-1 rounded">from:johndoe</code>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              For usernames with spaces:<br />
              <code class="bg-gray-100 px-1 rounded">from:"John Doe"</code>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              Multiple users:<br />
              <code class="bg-gray-100 px-1 rounded"
                >from:user1 from:user2</code
              >
            </div>
          </div>

          <div>
            <div class="font-medium">Exact match</div>
            <div class="text-gray-600 mt-1">
              <code class="bg-gray-100 px-1.5 py-0.5 rounded"
                >"exact phrase"</code
              >
            </div>
            <div class="text-xs text-gray-500 mt-1">
              Finds tweets with the exact phrase<br />
              Example:
              <code class="bg-gray-100 px-1 rounded">"machine learning"</code>
            </div>
          </div>
        </div>

        <div class="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-2">
          Tip: You can combine filters, e.g.
          <code class="bg-gray-100 px-1 rounded"
            >from:elonmusk "rocket launch"</code
          >
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const showSearchTips = ref(false);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
