<template>
  <div>
    <a :href="result.item.url" target="_blank">
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
import { useUrlExpansion } from "~/composables/useUrlExpansion";

const props = defineProps<{
  result: FuseResult<Tweet>;
  searchQuery: string;
}>();

const { expandUrls } = useUrlExpansion();

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
  let tweetText;
  if (props.result.item.links && props.result.item.links.length > 0) {
    // Expand any URLs in the tweet text
    tweetText = expandUrls(props.result.item.text, props.result.item.links);
  } else {
    tweetText = props.result.item.text;
  }

  // strip newlines that surround a user mention (ie strip newlines from \n@userhandle\n)
  const newlineUserMentionRegex = /\n(@[\w\d_]+)\n/g;
  const strippedText = tweetText.replace(newlineUserMentionRegex, "$1");
  const regex = new RegExp(props.searchQuery.trim(), "gi");
  return strippedText.replace(
    regex,
    (match) => `<span class="bg-yellow-200">${match}</span>`
  );
});
</script>
