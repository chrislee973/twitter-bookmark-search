<template>
  <div class="p-4 flex hover:bg-[rgba(0,0,0,0.03)] transition-colors">
    <!-- :class="{ 'border border-gray-200 rounded-xl': isQuote }" -->
    <div class="mr-2 w-10 h-10 flex-none">
      <img :src="tweet.user.profilePicUrl" class="rounded-full" />
    </div>
    <div class="w-full overflow-hidden text-ellipsis">
      <div class="flex gap-x-1 items-baseline">
        <div class="font-semibold">
          {{ tweet.user.name }}
        </div>

        <div class="ml-1 text-muted-foreground flex items-center">
          <div
            v-if="highlightedUserHandle"
            class="text-sm"
            v-html="highlightedUserHandle"
          ></div>
          <div v-else class="text-sm">
            {{ tweet.user.handle }}
          </div>

          <div class="p-1">·</div>
          <div class="text-sm">
            {{ formatDate(tweet.date) }}
          </div>
        </div>
      </div>

      <div
        v-if="highlightedText"
        class="whitespace-pre-wrap"
        v-html="highlightedText"
      ></div>
      <div v-else class="whitespace-pre-wrap">{{ tweet.text }}</div>
      <div id="media" class="grid grid-cols-2 gap-1 mt-3">
        <div v-for="media in tweet.media" :key="media.url">
          <img
            width="550"
            height="300"
            v-if="media.type === 'photo'"
            :src="media.url"
            class="rounded-xl"
          />
          <div v-else class="relative">
            <div class="flex items-center justify-center">
              <img
                width="550"
                height="300"
                :src="media.url"
                class="rounded-xl"
              />
              <Icon
                name="radix-icons:play"
                class="absolute inset-0 m-auto w-14 h-14 p-4 text-white bg-black rounded-full flex items-center justify-center"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- <div v-if="tweet.quote_status" id="qt" class="mt-3 max-h-[300px]"> -->
      <div v-if="tweet.quote_status" id="qt" class="mt-3">
        <div
          ref="quoteTweet"
          class="max-h-[300px] overflow-hidden relative border border-gray-200 rounded-xl"
        >
          <Tweet
            :tweet="tweet.quote_status"
            :is-quote="true"
            class="mb-0 border-none text-sm"
          />
          <div
            v-if="
              quoteTweet && quoteTweet.scrollHeight > quoteTweet.clientHeight
            "
            class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Tweet } from "~/types";
const props = defineProps<{
  tweet: Tweet;
  highlightedUserHandle?: string;
  highlightedText?: string;
  isQuote?: boolean;
}>();

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  let format: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (date.getFullYear() !== now.getFullYear()) {
    format.year = "numeric";
  }

  return date.toLocaleDateString(undefined, format);
}

const quoteTweet = ref<HTMLElement | null>(null);
</script>
