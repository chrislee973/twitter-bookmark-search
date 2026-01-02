<template>
  <div class="w-full my-8">
    <h2 class="text-2xl font-bold mb-4">
      Analyze and chat with your bookmarks using Claude Code
    </h2>

    <!-- Section 1: General Claude Code Workflow -->
    <div>
      <p class="mb-3">
        <a
          href="https://docs.anthropic.com/en/docs/claude-code"
          target="_blank"
          class="text-blue-600 underline"
          >Claude Code</a
        >
        is an AI assistant that runs locally on your computer. You can point it
        at your bookmarks and then chat with them in natural language. It'll
        write and run SQL queries, analyze patterns, and surface insights.
      </p>
      <p class="mb-3">
        Install Claude Code by following
        <a
          href="https://code.claude.com/docs/en/quickstart"
          target="_blank"
          class="text-blue-600 underline"
          >these instructions</a
        >. Then, download your bookmarks database below ("Download my bookmarks
        database" button at the bottom of the page) and save it somewhere on
        your computer. Open Claude Code in that same directory, and you're all
        set. Try asking questions like:
      </p>

      <ul class="pl-5 mb-3 list-disc space-y-1.5">
        <li>
          "Return the abstracts of my 5 most recent bookmarked arxiv papers"
        </li>
        <li>
          "Find bookmarks containing lesswrong links and summarize each post"
        </li>
        <li>"Create a chart of my bookmark frequency over time"</li>
        <li>"Who are my most bookmarked accounts?"</li>
      </ul>
    </div>

    <!-- Section 2: Taste Graph Analysis -->
    <div class="mt-8 pt-6 border-t">
      <h3 class="text-xl font-semibold mb-3">
        Go Deeper: Taste Graph Analysis
      </h3>
      <p class="mb-3">
        For a more structured deep-dive of your bookmarks, I created an
        opinionated prompt that helps surface interesting patterns and hidden
        connections in them. It also runs a sequence of temporal analyses to try
        to see how your tastes and interests might've changed over time.
        Hopefully you'll discover something interesting and come away
        understanding what your bookmarks reveal about you!
      </p>
      <p class="mb-3">A sample of some of the things it surfaces:</p>
      <ul class="pl-5 mb-3 list-disc space-y-1.5">
        <li>Topic clusters and how they relate</li>
        <li>Temporal patterns — how your interests evolve over time</li>
        <li>Your "intellectual north stars" vs accounts you've forgotten</li>
        <li>Co-occurrence networks (who you bookmark on the same days)</li>
        <li>Surprising outliers and anomalies</li>
        <li>What your bookmarks reveal about you</li>
        <li>Questions for reflection</li>
      </ul>

      <!-- Example Analysis Dropdown -->
      <details
        class="group border border-neutral-200 rounded-lg overflow-hidden mb-6"
      >
        <summary
          class="px-4 py-3 bg-neutral-50 cursor-pointer hover:bg-neutral-100 transition-colors flex items-center justify-between"
        >
          <span class="font-medium text-neutral-700"
            >See what an analysis of my bookmarks looks like</span
          >
          <span
            class="text-neutral-400 text-sm group-open:rotate-180 transition-transform"
            >▼</span
          >
        </summary>
        <div class="p-4 bg-white">
          <div v-if="!exampleAnalysis" class="text-neutral-500 text-sm">
            Loading...
          </div>
          <div
            v-else
            class="prose prose-sm prose-neutral max-w-none"
            v-html="exampleAnalysis"
          />
        </div>
      </details>

      <!-- Instructions subheader -->
      <h4 class="text-lg font-medium mb-3">Instructions</h4>
      <p class="mb-3">
        <a
          href="/taste-graph-prompt.md"
          download="taste-graph-prompt.md"
          class="text-blue-600 underline"
          >Download the analysis prompt</a
        >
        and click the "Download my bookmarks database" button below to download
        your bookmarks as a database file, making sure that the prompt and
        bookmarks database are saved in the same directory. Then run this in
        Claude Code:
      </p>
      <div
        class="bg-muted rounded-md px-4 py-3 font-mono text-sm mb-3 overflow-x-auto"
      >
        Using @taste-graph-prompt.md, run the analysis on @bookmarks.db
      </div>
    </div>

    <!-- No bookmarks state -->
    <div
      v-if="!bookmarks"
      class="mt-12 relative border-dashed border rounded-md h-[450px]"
    >
      <div class="absolute inset-0 m-auto h-fit w-fit text-center">
        <div class="font-semibold text-lg">No bookmarks file detected</div>
        <div class="text-sm text-muted-foreground mt-2">
          Follow the steps in
          <NuxtLink to="/" class="underline">the instructions</NuxtLink>
          and upload your bookmarks file.
        </div>
      </div>
    </div>

    <!-- Download button -->
    <div v-else class="mt-8 pt-6 border-t">
      <ClientOnly>
        <div class="space-y-4">
          <Button
            @click="convertToSqlite"
            :disabled="isProcessing"
            class="w-full"
          >
            <Icon
              v-if="isProcessing"
              name="heroicons:arrow-path"
              class="w-5 h-5 mr-2 animate-spin"
            />
            <Icon
              v-else
              name="heroicons:document-arrow-down"
              class="w-5 h-5 mr-2"
            />
            {{
              isProcessing ? "Converting..." : "Download my bookmarks database"
            }}
          </Button>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { bookmarks } from "~/composables/state";
import { marked } from "marked";

// Global reference to the SQL.js instance
let SQL: any = null;

// Single state for tracking conversion process
const isProcessing = ref(false);
const processingError = ref<Error | null>(null);

// Example analysis markdown
const exampleAnalysis = ref<string | null>(null);

onMounted(async () => {
  try {
    const response = await fetch("/taste-graph-analysis.md");
    const markdown = await response.text();
    exampleAnalysis.value = marked(markdown) as string;
  } catch (error) {
    console.error("Failed to load example analysis:", error);
  }
});

async function convertToSqlite() {
  if (!bookmarks.value) return;

  try {
    // Start processing - this covers both SQL loading and conversion
    isProcessing.value = true;
    processingError.value = null;

    // If SQL.js isn't loaded yet, load it first
    if (!SQL) {
      SQL = await loadCustomSqlJs();
    }

    // Ensure the UI updates by waiting for the next microtask
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Create a database
    const db = new SQL.Database();

    // Enable foreign key constraints
    db.run(`PRAGMA foreign_keys = ON;`);

    // Create tables with the same schema as in json_to_sqlite.py
    db.run(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,     -- The user's unique ID (from "user":{"id":...})
        name TEXT,               -- The user's display name (e.g. "George Mack")
        handle TEXT,             -- The user's Twitter handle (e.g. "george__mack")
        profilePicUrl TEXT,      -- URL of the user's profile picture
        verified BOOLEAN         -- Indicates whether this user is verified
        -- The 'users' table stores all metadata about a Twitter user referenced in 'bookmarks'.
      );
    `);

    db.run(`
      CREATE TABLE bookmarks (
        id TEXT PRIMARY KEY,     -- The bookmark's unique identifier (i.e. Tweet ID)
        date DATETIME,           -- When the tweet was posted (parsed to DATETIME)
        text TEXT,               -- Full text of the tweet
        url TEXT,                -- Direct URL to the tweet on Twitter
        quote_status TEXT,       -- JSON data for any quote-tweets, or NULL
        user_id TEXT,            -- Foreign key referencing users(id)
        FOREIGN KEY (user_id) REFERENCES users(id)
        -- The 'bookmarks' table holds one row per saved tweet.
        -- Each bookmark references exactly one user (the tweet author)
        -- and may have multiple 'media' or 'links'.
      );
    `);

    db.run(`
      CREATE TABLE media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bookmark_id TEXT,        -- References bookmarks(id) to indicate which tweet
        type TEXT,               -- can be "photo", "video", or "animated_gif"
        url TEXT,                -- Direct URL to this piece of media
        video_src TEXT,          -- JSON with multiple video bitrates if it's a video, and provides urls for each version of the video
        FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id)
        -- The 'media' table contains one row per media item for each bookmark.
        -- A single tweet/bookmark can have multiple images or videos.
      );
    `);

    db.run(`
      CREATE TABLE links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bookmark_id TEXT,        -- References bookmarks(id), i.e. which tweet
        shortUrl TEXT,           -- Shortened link (e.g. "https://t.co/...")
        expandedUrl TEXT,        -- Full expanded URL. Use this column when presenting to the user
        FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id)
        -- The 'links' table stores all embedded links (URLs) found in a bookmark's text. Useful for finding blog posts, youtube videos, research papers, etc that are contained in all the bookmarks.
        -- One bookmark can have zero, one, or multiple links.
      );
    `);

    // Insert data from bookmarks
    const userInsertStmt = db.prepare(
      "INSERT OR IGNORE INTO users (id, name, handle, profilePicUrl, verified) VALUES (?, ?, ?, ?, ?)"
    );

    const bookmarkInsertStmt = db.prepare(
      "INSERT INTO bookmarks (id, date, text, url, quote_status, user_id) VALUES (?, ?, ?, ?, ?, ?)"
    );

    const mediaInsertStmt = db.prepare(
      "INSERT INTO media (bookmark_id, type, url, video_src) VALUES (?, ?, ?, ?)"
    );

    const linkInsertStmt = db.prepare(
      "INSERT INTO links (bookmark_id, shortUrl, expandedUrl) VALUES (?, ?, ?)"
    );

    // Process all bookmarks
    for (const tweet of bookmarks.value) {
      // Insert user
      userInsertStmt.run([
        tweet.user.id,
        tweet.user.name,
        tweet.user.handle,
        tweet.user.profilePicUrl,
        tweet.user.verified ? 1 : 0,
      ]);

      // Insert bookmark
      const quoteStatusJson = tweet.quote_status
        ? JSON.stringify(tweet.quote_status)
        : null;
      bookmarkInsertStmt.run([
        tweet.id,
        parseDateString(tweet.date),
        tweet.text,
        tweet.url,
        quoteStatusJson,
        tweet.user.id,
      ]);

      // Insert media items
      if (tweet.media && tweet.media.length > 0) {
        for (const media of tweet.media) {
          const videoSrcJson = media.video_src
            ? JSON.stringify(media.video_src)
            : null;
          mediaInsertStmt.run([tweet.id, media.type, media.url, videoSrcJson]);
        }
      }

      // Insert links
      if (tweet.links && tweet.links.length > 0) {
        for (const link of tweet.links) {
          linkInsertStmt.run([tweet.id, link.shortUrl, link.expandedUrl]);
        }
      }
    }

    // Create and populate FTS table
    // Create the external-content FTS5 table
    db.run(`
      CREATE VIRTUAL TABLE bookmarks_fts
      USING fts5(
        text,                -- from bookmarks.text
        link_text,           -- will store all expanded URLs for the bookmark
        content='bookmarks', -- external content table
        content_rowid='id'   -- use bookmarks.id as the rowid
      );
    `);

    // Populate the FTS table by joining bookmarks + links
    // We group by b.id so each bookmark is one row in FTS,
    // and we combine all expandedUrl strings (for any embedded links) into one column (link_text).
    db.run(`
      INSERT INTO bookmarks_fts(rowid, text, link_text)
      SELECT b.id AS rowid,
             b.text AS text,
             COALESCE(GROUP_CONCAT(l.expandedUrl, ' '), '')
      FROM bookmarks b
      LEFT JOIN links l ON b.id = l.bookmark_id
      GROUP BY b.id;
    `);

    // Finalize prepared statements
    userInsertStmt.free();
    bookmarkInsertStmt.free();
    mediaInsertStmt.free();
    linkInsertStmt.free();

    // Export the database as a binary blob
    const data = db.export();
    const blob = new Blob([data], { type: "application/x-sqlite3" });
    const url = URL.createObjectURL(blob);

    // Create a download link
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookmarks.db";
    a.click();

    // Clean up
    URL.revokeObjectURL(url);
    db.close();
  } catch (error) {
    console.error("Error during conversion:", error);
    alert("An error occurred during conversion. Please try again.");
    processingError.value =
      error instanceof Error ? error : new Error(String(error));
  } finally {
    isProcessing.value = false;

    // Reset SQL instance to ensure a fresh start on next conversion
    SQL = null;
  }
}

/**
 * Dynamically loads the custom SQL.js build with FTS5 support
 */
async function loadCustomSqlJs(): Promise<any> {
  try {
    // Define the paths to your custom SQL.js files
    const scriptPath = "/js/sql/sql-wasm.js";
    const wasmPath = "/js/sql/sql-wasm.wasm";

    // Load the JS file
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = scriptPath;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load custom SQL.js`));
      document.head.appendChild(script);
    });

    // Initialize SQL.js with the custom WASM file
    // @ts-expect-error - initSqlJs is added to window by the script
    return await initSqlJs({
      locateFile: () => wasmPath,
    });
  } catch (error) {
    console.error("Failed to load custom SQL.js:", error);
    throw new Error(
      "Could not load custom SQL database library. Please try again."
    );
  }
}

function parseDateString(dateStr: string): string | null {
  if (!dateStr) return null;

  const formats = [
    {
      regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      format: (d: string) =>
        d.replace("T", " ").replace("Z", "").substring(0, 19),
    },
    {
      regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
      format: (d: string) => d.replace("T", " ").replace("Z", ""),
    },
  ];

  for (const format of formats) {
    if (format.regex.test(dateStr)) {
      return format.format(dateStr);
    }
  }

  return dateStr;
}
</script>

<style scoped>
/* Prose styling for the embedded markdown */
:deep(.prose) {
  @apply text-neutral-700;
}

:deep(.prose h1) {
  @apply text-xl font-semibold mt-0 mb-4;
}

:deep(.prose h2) {
  @apply text-lg font-semibold mt-6 mb-3;
}

:deep(.prose h3) {
  @apply text-base font-semibold mt-4 mb-2;
}

:deep(.prose pre) {
  @apply bg-neutral-900 text-neutral-100 rounded-md p-3 overflow-x-auto text-xs;
}

:deep(.prose code:not(pre code)) {
  @apply bg-neutral-100 px-1.5 py-0.5 rounded text-sm text-neutral-800;
}

:deep(.prose ul) {
  @apply list-disc pl-5 space-y-1;
}

:deep(.prose ol) {
  @apply list-decimal pl-5 space-y-1;
}

:deep(.prose li) {
  @apply text-neutral-600;
}

:deep(.prose strong) {
  @apply font-semibold text-neutral-800;
}

:deep(.prose em) {
  @apply italic text-neutral-600;
}

:deep(.prose hr) {
  @apply border-neutral-200 my-6;
}

:deep(.prose blockquote) {
  @apply border-l-4 border-neutral-300 pl-4 italic text-neutral-600;
}
</style>
