<template>
  <div class="max-w-3xl mx-auto min-h-screen flex flex-col">
    <main class="px-5 grow">
      <div class="flex flex-col items-center gap-2 pt-14 sm:pt-32">
        <div
          class="text-center text-2xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]"
        >
          Twitter Bookmark Search
          <Icon name="radix-icons:bookmark-filled" color="#1d9bf0" />
        </div>
        <div class="max-w-[550px] text-center sm:text-lg text-muted-foreground">
          Liberate your bookmarks! Export, search, and chat with your Twitter
          bookmarks.

          <span>
            Everything open sourced
            <a
              href="https://github.com/chrislee973/twitter-bookmark-search"
              target="_blank"
              class="inline-flex items-center underline hover:text-gray-900 transition-colors"
            >
              here <Icon name="mdi:github" class="w-4 h-4 ml-0.5" />
            </a>
          </span>
        </div>
        <div class="sm:hidden italic text-sm mb-2 text-center">
          This is primarily meant to be used on desktop, so it currently isn't
          very mobile-friendly.
        </div>
      </div>
      <nav class="mt-4 flex gap-6 items-center justify-center text-sm">
        <NuxtLink
          to="/"
          active-class="font-semibold border-b-2 border-blue-twitter !text-blue-twitter"
          class="text-foreground/60"
          >Instructions</NuxtLink
        >
        <NuxtLink
          active-class="font-semibold border-b-2 border-blue-twitter !text-blue-twitter"
          class="text-foreground/60"
          to="/search"
          >Search</NuxtLink
        >
        <NuxtLink
          active-class="font-semibold border-b-2 border-blue-twitter !text-blue-twitter"
          class="text-foreground/60 flex items-center gap-0.5"
          to="/chat"
        >
          <Icon name="mynaui:sparkles-solid" class="w-4 h-4" />
          AI Chat
        </NuxtLink>
      </nav>
      <NuxtPage />
    </main>
    <Footer class="mt-auto" />
  </div>
</template>
