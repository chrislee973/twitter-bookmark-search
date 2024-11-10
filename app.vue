<template>
  <a href="https://x.com/626ripes/status/1810770370087244238" target="_blank">
    <div class="md:p-2 p-4 bg-[#1b9bee] text-white">
      <div class="flex items-center justify-center md:text-base text-sm">
        <Icon name="fluent-emoji-flat:megaphone" class="w-5 h-5 mr-2" />
        Bookmark search is now a native feature on Twitter/X!
      </div>
      <div class="flex items-center justify-center mt-2 md:text-sm text-xs">
        Out of pride, I will still be using and maintaining this app, so feel
        free to stick around and continue using this :)
      </div>
    </div>
  </a>
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
          Liberate your bookmarks! Rediscover the buried treasures in your
          archive. All data stays private and local to your computer.
          <span class="ml-1">
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
