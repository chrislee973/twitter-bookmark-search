<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-8 text-center">
      Search Tips Design Options
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
      <!-- Option 1: Collapsible Help Panel Below Search Bar -->
      <div class="border rounded-lg p-6 shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Option 1: Collapsible Panel</h2>
        <p class="text-sm text-gray-600 mb-6">
          A collapsible panel that appears below the search bar.
        </p>

        <div class="relative w-full max-w-[320px] mx-auto">
          <input
            type="text"
            placeholder="Search"
            class="px-4 py-2 rounded-3xl border-none focus:outline-none focus:ring-1 focus:ring-blue-twitter placeholder:text-muted-foreground focus:bg-white w-full h-[45px] bg-[#eff3f4] block"
          />

          <div class="mt-2 text-center">
            <button
              @click="showOption1 = !showOption1"
              class="text-sm text-blue-twitter hover:underline flex items-center justify-center mx-auto"
            >
              <span>Search tips</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 ml-1"
                :class="
                  showOption1
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
                v-if="showOption1"
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
                      <code class="bg-gray-100 px-1 rounded"
                        >from:"John Doe"</code
                      >
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
                      <code class="bg-gray-100 px-1 rounded"
                        >"machine learning"</code
                      >
                    </div>
                  </div>
                </div>
                <div
                  class="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-2"
                >
                  Tip: You can combine filters, e.g.
                  <code class="bg-gray-100 px-1 rounded"
                    >from:elonmusk "rocket launch"</code
                  >
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Option 2: Inline Help Icons in Search Bar -->
      <div class="border rounded-lg p-6 shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Option 2: Inline Help Icon</h2>
        <p class="text-sm text-gray-600 mb-6">
          A help icon inside the search bar with a tooltip.
        </p>

        <div class="relative w-full max-w-[320px] mx-auto">
          <div class="relative">
            <input
              type="text"
              placeholder="Search"
              class="px-4 py-2 pr-10 rounded-3xl border-none focus:outline-none focus:ring-1 focus:ring-blue-twitter placeholder:text-muted-foreground focus:bg-white w-full h-[45px] bg-[#eff3f4] block"
            />
            <div
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-help"
              @mouseenter="showOption2 = true"
              @mouseleave="showOption2 = false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <Transition name="fade">
                <div
                  v-if="showOption2"
                  class="absolute right-0 top-8 w-64 p-3 bg-white rounded-lg shadow-md border border-gray-200 text-left text-sm z-10"
                >
                  <div class="mb-2">
                    <div class="font-medium">Filter by user</div>
                    <div class="text-gray-600 mt-1">
                      <code class="text-xs bg-gray-100 px-1 py-0.5 rounded"
                        >from:username</code
                      >
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      For usernames with spaces:
                      <code class="bg-gray-100 px-1 rounded"
                        >from:"John Doe"</code
                      >
                    </div>
                  </div>
                  <div>
                    <div class="font-medium">Exact match</div>
                    <div class="text-gray-600 mt-1">
                      <code class="text-xs bg-gray-100 px-1 py-0.5 rounded"
                        >"exact phrase"</code
                      >
                    </div>
                  </div>
                  <div
                    class="mt-2 text-xs text-gray-500 border-t border-gray-100 pt-2"
                  >
                    Combine:
                    <code class="bg-gray-100 px-1 rounded"
                      >from:user "phrase"</code
                    >
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <!-- Option 3: Placeholder Text Hints -->
      <div class="border rounded-lg p-6 shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Option 3: Placeholder Text</h2>
        <p class="text-sm text-gray-600 mb-6">
          Using the placeholder text to hint at search capabilities.
        </p>

        <div class="relative w-full max-w-[320px] mx-auto">
          <input
            type="text"
            placeholder='Search (try from:username or "exact phrase")'
            class="px-4 py-2 rounded-3xl border-none focus:outline-none focus:ring-1 focus:ring-blue-twitter placeholder:text-muted-foreground focus:bg-white w-full h-[45px] bg-[#eff3f4] block"
          />
        </div>
      </div>

      <!-- Option 4: Modal Dialog with Examples -->
      <div class="border rounded-lg p-6 shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Option 4: Modal Dialog</h2>
        <p class="text-sm text-gray-600 mb-6">
          A help icon that opens a detailed modal with examples.
        </p>

        <div class="relative w-full max-w-[320px] mx-auto">
          <div class="flex items-center">
            <input
              type="text"
              placeholder="Search"
              class="px-4 py-2 rounded-3xl border-none focus:outline-none focus:ring-1 focus:ring-blue-twitter placeholder:text-muted-foreground focus:bg-white w-full h-[45px] bg-[#eff3f4] block"
            />
            <button
              @click="showOption4 = true"
              class="ml-2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              title="Search tips"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal for search tips -->
        <Transition name="fade">
          <div
            v-if="showOption4"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium">Advanced Search Tips</h3>
                <button
                  @click="showOption4 = false"
                  class="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div class="space-y-4">
                <div>
                  <div class="font-medium">Filter by user</div>
                  <div class="flex items-center mt-1">
                    <code class="bg-gray-100 px-2 py-1 rounded text-sm"
                      >from:username</code
                    >
                  </div>
                  <div class="text-sm text-gray-600 mt-1">
                    Shows tweets from specific users.<br />
                    Example:
                    <code class="bg-gray-100 px-1 rounded">from:johndoe</code>
                  </div>
                </div>

                <div>
                  <div class="font-medium">Usernames with spaces</div>
                  <div class="flex items-center mt-1">
                    <code class="bg-gray-100 px-2 py-1 rounded text-sm"
                      >from:"John Doe"</code
                    >
                  </div>
                </div>

                <div>
                  <div class="font-medium">Multiple users</div>
                  <div class="flex items-center mt-1">
                    <code class="bg-gray-100 px-2 py-1 rounded text-sm"
                      >from:user1 from:user2</code
                    >
                  </div>
                </div>

                <div>
                  <div class="font-medium">Exact phrase match</div>
                  <div class="flex items-center mt-1">
                    <code class="bg-gray-100 px-2 py-1 rounded text-sm"
                      >"exact phrase"</code
                    >
                  </div>
                  <div class="text-sm text-gray-600 mt-1">
                    Finds tweets containing the exact phrase.<br />
                    Example:
                    <code class="bg-gray-100 px-1 rounded"
                      >"machine learning"</code
                    >
                  </div>
                </div>

                <div>
                  <div class="font-medium">Combine filters</div>
                  <div class="flex items-center mt-1">
                    <code class="bg-gray-100 px-2 py-1 rounded text-sm"
                      >from:username "exact phrase"</code
                    >
                  </div>
                  <div class="text-sm text-gray-600 mt-1">
                    Example:
                    <code class="bg-gray-100 px-1 rounded"
                      >from:elonmusk "rocket launch"</code
                    >
                  </div>
                </div>
              </div>

              <button
                @click="showOption4 = false"
                class="mt-6 w-full py-2 bg-blue-twitter text-white rounded-md hover:bg-blue-600"
              >
                Got it
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Bonus: Option 5 - Keyboard Shortcut -->
    <div class="border rounded-lg p-6 shadow-sm max-w-2xl mx-auto">
      <h2 class="text-xl font-semibold mb-4">Option 5: Keyboard Shortcut</h2>
      <p class="text-sm text-gray-600 mb-6">
        Press the "/" key to focus the search and show a quick tip.
      </p>

      <div class="relative w-full max-w-[320px] mx-auto">
        <input
          type="text"
          placeholder="Search (press ? for help)"
          class="px-4 py-2 rounded-3xl border-none focus:outline-none focus:ring-1 focus:ring-blue-twitter placeholder:text-muted-foreground focus:bg-white w-full h-[45px] bg-[#eff3f4] block"
          @focus="showOption5 = true"
          @blur="showOption5 = false"
        />

        <Transition name="fade">
          <div
            v-if="showOption5"
            class="absolute top-full mt-2 left-0 right-0 p-3 bg-white rounded-lg shadow-md border border-gray-200 text-left text-sm"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium">Search Shortcuts</span>
              <span class="text-xs text-gray-500">Press Esc to close</span>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <div class="font-medium text-xs mb-1">Filter by user</div>
                <code class="bg-gray-100 px-1 py-0.5 rounded text-xs"
                  >from:username</code
                >
              </div>
              <div>
                <div class="font-medium text-xs mb-1">Exact match</div>
                <code class="bg-gray-100 px-1 py-0.5 rounded text-xs"
                  >"exact phrase"</code
                >
              </div>
              <div class="col-span-2 mt-2 text-xs">
                <span class="font-medium">Tip:</span> Combine with
                <code class="bg-gray-100 px-1 rounded">from:user "phrase"</code>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <div class="mt-12 text-center">
      <NuxtLink to="/search" class="text-blue-twitter hover:underline">
        Back to Search
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  noRedirect: true,
});

// State for each option
const showOption1 = ref(false);
const showOption2 = ref(false);
const showOption4 = ref(false);
const showOption5 = ref(false);
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

/* Twitter blue color */
.text-blue-twitter {
  color: #1da1f2;
}

.bg-blue-twitter {
  background-color: #1da1f2;
}
</style>
