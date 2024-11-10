// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "nuxt-icon", "shadcn-nuxt", "@vueuse/nuxt"],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  routeRules: {
    "/": { prerender: true },
  },
  app: {
    head: {
      title: "Twitter Bookmark Search | Search your Twitter bookmarks",
      meta: [
        {
          name: "description",
          content:
            "Twitter Bookmark Search is a tool for scraping and searching your Twitter bookmarks archive.",
        },
        { property: "og:title", content: "Twitter Bookmark Search" },
        {
          property: "og:image",
          content: "https://twitter-bookmarks-search.vercel.app/ogimage.png",
        },
        {
          name: "twitter:image",
          content: "https://twitter-bookmarks-search.vercel.app/ogimage.png",
        },
        {
          property: "og:description",
          content:
            "Twitter Bookmark Search is a tool for scraping and searching your Twitter bookmarks archive.",
        },
        { property: "twitter:card", content: "summary_large_image" },
      ],
    },
  },
  runtimeConfig: {
    public: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    },
  },
  tailwindcss: {
    config: {
      plugins: [require("@tailwindcss/typography")],
    },
  },
});
