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
    <div class="text-lg font-semibold text-center mb-2">
      My most bookmarked users
    </div>

    <!-- User list container with proper borders -->
    <div
      class="w-[600px] mx-auto border border-border rounded-xl overflow-hidden"
    >
      <div
        v-for="{ user, count } in mostBookmarkedUsers?.slice(
          0,
          numberBookmarkedUsersToDisplay
        ) || []"
        :key="user.handle"
        class="p-2 flex justify-between border-b border-border last:border-b-0"
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

    <!-- Show More button -->
    <div
      v-if="
        mostBookmarkedUsers &&
        mostBookmarkedUsers.length > numberBookmarkedUsersToDisplay
      "
      class="text-center mt-4"
    >
      <Button @click="numberBookmarkedUsersToDisplay += 20" variant="outline">
        Show More Users
      </Button>
    </div>

    <!-- Counter text -->
    <div class="text-center text-sm text-muted-foreground mt-2">
      Showing
      {{
        Math.min(
          numberBookmarkedUsersToDisplay,
          mostBookmarkedUsers?.length || 0
        )
      }}
      of {{ mostBookmarkedUsers?.length || 0 }} bookmarked users
    </div>
  </div>
</template>

<script setup lang="ts">
import { bookmarks, mostBookmarkedUsers } from "~/composables/state";
import Button from "~/components/ui/button/Button.vue";

// Counter for number of users to display
const numberBookmarkedUsersToDisplay = ref(10);
</script>
