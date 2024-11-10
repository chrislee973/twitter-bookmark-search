<template>
  <div id="stats">
    <div class="flex gap-1 items-center w-fit mx-auto mb-3">
      <div class="text-lg font-semibold text-center">Total bookmarks</div>
      <div class="relative w-fit">
        <Icon
          class="w-[60px] h-[60px]"
          name="radix-icons:bookmark-filled"
          color="#1d9bf0"
        />
        <div
          class="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold"
        >
          {{ bookmarks?.length }}
        </div>
      </div>
    </div>

    <!-- <BookmarkedUserStats /> -->
    <div class="text-lg font-semibold text-center">
      Your 10 most bookmarked users
    </div>
    <div>
      <div
        v-for="{ user, count } in mostBookmarkedUsers"
        :key="user.handle"
        class="p-2 flex w-[600px] mx-auto justify-between border border-border border-b-0 last:border-b first:rounded-t-xl last:rounded-b-xl"
      >
        <div class="flex gap-3 items-center">
          <img :src="user.profilePicUrl" class="rounded-full w-8 h-8" alt="" />
          <div>
            <div>{{ user.name }}</div>
            <div class="text-muted-foreground text-sm">@{{ user.handle }}</div>
          </div>
        </div>
        <div class="flex items-center gap-1">
          {{ count }}
          <Icon name="radix-icons:bookmark-filled" color="#1d9bf0" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { bookmarks, mostBookmarkedUsers } from "~/composables/state";
</script>
