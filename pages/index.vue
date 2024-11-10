<template>
  <div id="steps" class="max-w-[550px] mx-auto my-6 sm:my-10">
    <!-- <Blah /> -->
    <div class="font-semibold mb-2">Instructions</div>
    <div class="[&>h3]:step mb-12 ml-4 border-l pl-8 [counter-reset:step]">
      <h3>
        <div class="mb-2">Setup</div>
        <div class="text-sm text-muted-foreground">
          Exporting your bookmarks requires running a snippet of code in your
          Twitter bookmarks page. There are 2 methods of running this code: one
          as a bookmarklet and the other manually in the dev console. I'd
          recommend the bookmarklet method as it's more convenient and you don't
          have to do anything technical.
          <a
            href="https://gist.github.com/chrislee973/3950b0582c7dc460b06c11a2eeebeca8"
            target="_blank"
            class="underline"
            >This</a
          >
          is the code snippet that runs behind the scenes if you're curious.
        </div>
        <Tabs
          v-model:model-value="selectedScriptInitMethod"
          class="relative mr-auto w-full"
        >
          <TabsList
            class="w-full justify-start rounded-none border-b bg-transparent p-0"
          >
            <TabsTrigger
              value="bookmarklet"
              class="text-xs relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Bookmarklet
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              class="text-xs relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Manual
            </TabsTrigger>
          </TabsList>
          <TabsContent value="bookmarklet">
            <div class="mt-3">
              Create the bookmarklet by dragging and dropping this link:
              <a class="underline" :href="bookmarkletCode">
                Twitter Bookmarks Export</a
              >
              to your bookmarks bar.
            </div>
            <video
              class="mt-3 w-full"
              controls
              src="https://pub-4abc039d4e604d28acd621a4ae941f49.r2.dev/bookmarklet_setup.mp4"
            ></video>
          </TabsContent>
          <TabsContent value="manual">
            <div>
              Copy the code snippet from
              <a
                href="https://gist.github.com/chrislee973/3950b0582c7dc460b06c11a2eeebeca8"
                target="_blank"
                class="underline"
                >here</a
              >
              or

              <button
                type="button"
                class="focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-75 flex-shrink-0 font-medium rounded-md text-xs gap-x-1.5 p-1.5 text-slate-600 bg-gray-100 hover:bg-gray-200 transition-colors focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 inline-flex items-center"
                aria-label="Copy code to clipboard"
                tabindex="-1"
                title="Copy to clipboard"
                @click="copyScriptToClipboard"
              >
                <div
                  v-if="!showCopiedSuccess"
                  class="flex items-center gap-x-1"
                >
                  <Icon
                    name="ph-copy-duotone"
                    class="flex-shrink-0 h-4 w-4"
                    aria-hidden="true"
                  ></Icon>
                  click here to copy to your clipboard
                </div>
                <div v-else class="flex items-center gap-x-1 text-slate-600">
                  <Icon name="ph:check" class="flex-shrink-0 h-4 w-4"></Icon>
                  <div>Copied!</div>
                </div>
              </button>
            </div></TabsContent
          >
        </Tabs>
      </h3>

      <h3 class="mt-8">
        <div class="mb-2">
          Navigate to your
          <a
            href="https://twitter.com/i/bookmarks"
            target="_blank"
            class="underline"
            >Twitter bookmarks</a
          >
          tab and run the code snippet
        </div>
        <Tabs
          v-model:model-value="selectedScriptInitMethod"
          class="relative mr-auto w-full"
        >
          <TabsList
            class="w-full justify-start rounded-none border-b bg-transparent p-0"
          >
            <TabsTrigger
              value="bookmarklet"
              class="text-xs relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Bookmarklet
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              class="text-xs relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Manual
            </TabsTrigger>
          </TabsList>
          <TabsContent value="bookmarklet">
            <div class="mt-3">
              Click the bookmarklet you just added to your bookmarks bar.
              Anytime you want to re-export your bookmarks in the future, simply
              click this bookmarklet!
            </div>
            <video
              class="mt-3 w-full"
              controls
              src="https://pub-4abc039d4e604d28acd621a4ae941f49.r2.dev/bookmarklet_run.mp4"
            ></video>
          </TabsContent>
          <TabsContent value="manual">
            <div class="mt-3">
              <div
                class="sm:hidden text-sm border border-yellow-400/30 bg-yellow-500/10 text-yellow-400 rounded-lg p-3"
              >
                📱 Mobile users: Exporting your bookmarks involves running a
                piece of code in the browser dev console, so this step should be
                done on a desktop.
              </div>
              Run the code snippet you copied from step 1 into the dev
              console<span class="text-muted-foreground">&#x2A;</span>
              <p class="text-sm text-muted-foreground mt-1">
                <span class="text-muted-foreground">&#x2A;</span>Right click
                anywhere on the page &#8594; click "Inspect" &#8594; click
                "Console" tab &#8594; Paste the code snippet &#8594; hit Enter
                key).
              </p>
              <video
                class="mt-3 w-full"
                controls
                src="https://pub-4abc039d4e604d28acd621a4ae941f49.r2.dev/devconsole-demo.mp4"
              ></video></div
          ></TabsContent>
        </Tabs>
      </h3>

      <h3 class="mt-8">
        Although you can change tabs, do not close the tab while the script
        runs. Depending on how many bookmarks you've saved, this might take a
        few minutes. Don't be alarmed if you see the window scrolling by itself,
        that's how the script collects the bookmarks.
      </h3>
      <h3 class="mt-8">
        After the script has completed running, you'll be prompted to save a
        file containing all your bookmarks. Upload the file below 👇.
        <p class="text-sm text-muted-foreground mt-1">
          If you reran the script and have a new bookmarks file, upload the new
          one and it will overwrite the old one.
        </p>
      </h3>
    </div>
    <FileUpload />
  </div>
</template>

<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { escapedCode, bookmarkletCode } from "~/composables/exportScripts";

const showCopiedSuccess = ref(false);
const selectedScriptInitMethod = ref<"bookmarklet" | "manual">("bookmarklet");

function copyScriptToClipboard() {
  navigator.clipboard.writeText(escapedCode);
  showCopiedSuccess.value = true;
  setTimeout(() => {
    showCopiedSuccess.value = false;
  }, 2000);
}
</script>
