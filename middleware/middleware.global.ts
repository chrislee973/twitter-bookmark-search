export default defineNuxtRouteMiddleware((to, from) => {
  const savedBookmarks = useLocalStorage<Object[] | null>(
    "twitter-bookmarks",
    null
  );

  const isNavigatingToHome = to.path === "/";
  const isComingFromSearchOrChat = [
    "/search",
    "/claude-plugin",
    "/export",
  ].includes(from.path);

  if (savedBookmarks.value && isNavigatingToHome && !isComingFromSearchOrChat) {
    return navigateTo("/search");
  }
});
