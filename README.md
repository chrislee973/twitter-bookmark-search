# Twitter Bookmark Search

**Disclaimer: I'm not a software engineer, so I make no claims as to the quality of this code ;)**

Liberate your bookmarks! This repo is the code behind https://twitter-bookmark-search.vercel.app/

### Key Features

- a script to scrape your Twitter bookmarks as a json file
- a simple web UI to search your exported bookmarks
- a chat-with-your-bookmarks feature (bring your own OpenAI key)
  - Note: I'm currently just naively shoving the entire bookmarks json into the prompt (see `composables/useBookmarkChat.js`). Depending on how many bookmarks you have, this may exceed the context window length. Consider feeding a filtered slice of your bookmarks into the prompt.

## Setup

1. Clone the repository
2. Install dependencies:

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

3. (Optional) If you'd like to take advantage of the chat-with-your-bookmarks feature, create a `.env` file in the root directory and add your OpenAI API key:

```
OPENAI_API_KEY=your_api_key_here
```

## Development

Start the development server on http://localhost:3000:

```bash
npm run dev
```
