import { get } from "idb-keyval";

export default defineNuxtRouteMiddleware(async (to, from) => {
  // IndexedDB doesn't exist on server
  if (import.meta.server) return;

  const isNavigatingToHome = to.path === "/";
  const isComingFromSearchOrChat = [
    "/search",
    "/claude-plugin",
    "/export",
  ].includes(from.path);

  if (isNavigatingToHome && !isComingFromSearchOrChat) {
    try {
      const savedBookmarks = await get("twitter-bookmarks");
      if (
        savedBookmarks &&
        Array.isArray(savedBookmarks) &&
        savedBookmarks.length > 0
      ) {
        return navigateTo("/search");
      }
    } catch (e) {
      // IndexedDB not available or error - continue normally
      console.warn("[middleware] Could not check IndexedDB:", e);
    }
  }
});
