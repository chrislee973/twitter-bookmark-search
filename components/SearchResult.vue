<template>
  <div>
    <a :href="result.item.url" target="_blank">
      <!-- <div class="border border-gray-200 p-4 mb-5 flex rounded-xl">
      <div class="mr-2 w-10 h-10 flex-none">
        <img :src="result.item.user.profilePicUrl" class="rounded-full" />
      </div>
      <div class="w-full overflow-hidden text-ellipsis">
        <div class="flex gap-x-1 items-baseline">
          <div class="font-semibold">
            {{ result.item.user.name }}
          </div>

          <div class="ml-1 text-muted-foreground flex items-center">
            <div class="text-sm" v-html="highlightedAuthorHandle"></div>

            <div class="p-1">·</div>
            <div class="text-sm">
              {{ formatDate(result.item.date) }}
            </div>
          </div>
        </div>

        <div class="whitespace-pre-wrap" v-html="higlightedText"></div>
        <div id="media" class="grid grid-cols-2 gap-1">
          <div v-for="media in result.item.media" :key="media.url">
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
      </div>
    </div> -->
      <Tweet
        :tweet="result.item"
        :highlighted-text="highlightedText"
        :highlighted-user-handle="highlightedUserHandle"
      />
    </a>
  </div>
</template>

<script setup lang="ts">
import { type FuseResult } from "fuse.js";
import type { Tweet } from "~/types";

const props = defineProps<{
  result: FuseResult<Tweet>;
  searchQuery: string;
}>();

const highlightedUserHandle = computed(() => {
  return (
    "@" +
    props.result.item.user.handle.replace(
      new RegExp(props.searchQuery.trim(), "gi"),
      (match) => `<span class="bg-yellow-200">${match}</span>`
    )
  );
});
const highlightedText = computed(() => {
  if (props.result.item.text) {
    // strip newlines that surround a user mention (ie strip newlines from \n@userhandle\n)
    const newlineUserMentionRegex = /\n(@[\w\d_]+)\n/g;
    const strippedText = props.result.item.text.replace(
      newlineUserMentionRegex,
      "$1"
    );
    const regex = new RegExp(props.searchQuery.trim(), "gi");
    // return props.result.item.text.replace(
    return strippedText.replace(
      regex,
      (match) => `<span class="bg-yellow-200">${match}</span>`
    );
  } else {
    return "";
  }
});
</script>
