import type { Tweet, User } from "~/types";

export const isUseLocalStorage = useLocalStorage(
  "twitter-bookmarks-uselocalstorage",
  false
);

export const bookmarks = ref<Tweet[] | null>(null);

export const mostBookmarkedUsers = computed(() => {
  if (!bookmarks.value) return;

  const usersToCounts = new Map<string, { user: User; count: number }>();

  bookmarks.value.forEach((bookmark) => {
    if (!bookmark.user) {
      console.error("Bookmark does not have a user: ", bookmark);
    }
    const userHandle = bookmark.user.handle;

    if (usersToCounts.has(userHandle)) {
      usersToCounts.get(userHandle)!.count++;
    } else {
      // const author: User = {
      //   name: bookmark.authorName,
      //   handle: userHandle,
      //   profilePic: bookmark.authorProfilePic,
      // };

      usersToCounts.set(userHandle, { user: bookmark.user, count: 1 });
    }
  });

  const sortedUsersToCounts = Array.from(usersToCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return sortedUsersToCounts;
});
