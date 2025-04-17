<template>
  <div class="w-full my-8">
    <h2 class="text-2xl font-bold mb-4">Chat with your bookmarks</h2>

    <div>
      <p class="mb-3">
        You can chat with and analyze your bookmarks directly in Claude Desktop
        via MCP Server. MCP servers are like plugins for Claude Desktop that
        give it access to external data like your bookmarks. A bit like browser
        extensions.
      </p>
      <p>
        Click the button below to download a sqlite database file of your
        bookmarks, then
        <a
          href="https://github.com/chrislee973/twitter-bookmark-mcp"
          target="_blank"
          class="text-blue-600 underline"
          >follow these instructions</a
        >
        to set up the MCP Server that connects this database to Claude Desktop
        (fair warning though, right now the setup process for MCP servers is
        pretty tedious and finicky). Then you can start asking questions like:
      </p>

      <ul class="text-sm pl-5 mb-3 list-disc space-y-1.5 mt-2">
        <li>
          "Return the abstracts of my 5 most recent bookmarked arxiv papers"
        </li>
        <li>
          "Look through my twitter bookmarks for bookmarks that contain a link
          to the blog lesswrong, and summarize the content of each of those blog
          posts"
        </li>
        <li>"Create a chart of my bookmark frequency over time"</li>
      </ul>
    </div>

    <!-- <div
      v-if="!bookmarks"
      class="rounded-lg bg-amber-50 p-4 border border-amber-200 mb-6"
    >
      <p class="text-amber-800 mb-2 font-medium">No bookmarks data found</p>
      <p class="text-amber-700">
        Please go to the
        <NuxtLink to="/" class="underline font-medium">Instructions</NuxtLink>
        page first and upload your bookmarks JSON file.
      </p>
    </div> -->
    <div
      v-if="!bookmarks"
      class="mt-12 relative border-dashed border rounded-md h-[450px]"
    >
      <div class="absolute inset-0 m-auto h-fit w-fit text-center">
        <div class="font-semibolt text-lg">No bookmarks file detected</div>
        <div class="text-sm text-muted-foreground mt-2">
          Follow the steps in
          <NuxtLink to="/" class="underline">the instructions </NuxtLink>
          and upload your bookmarks file.
        </div>
      </div>
    </div>

    <div v-else>
      <!-- <p class="mb-4 text-muted-foreground">
        Convert your bookmarks to a SQLite database for more powerful querying
        and offline analysis.
      </p> -->

      <ClientOnly>
        <div class="mt-4 space-y-4">
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

// Global reference to the SQL.js instance
let SQL: any = null;

// Single state for tracking conversion process
const isProcessing = ref(false);
const processingError = ref<Error | null>(null);

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
