# Twitter Bookmark Search

This repo is the code behind https://twitter-bookmark-search.com.

Liberate your bookmarks! This project provides methods for exporting your bookmarks from Twitter and a simple interface for searching and chatting with them.

### Key Features

- a script to scrape your Twitter bookmarks as a json file
- a simple web UI to search your exported bookmarks
- a chat-with-your-bookmarks feature (bring your own OpenAI or Google Gemini key)
  - Note: Right now I'm just stuffing the entire bookmarks json into the prompt (see `composables/useBookmarkChat.js`). Depending on how many bookmarks you have, this may exceed the context window length. Consider feeding a filtered slice of your bookmarks into the prompt or use Gemini Pro, which has a 2M token context window.

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

3. (Optional) If you'd like to take advantage of the chat-with-your-bookmarks feature, create a `.env` file in the root directory and add your OpenAI or Google Gemini API key:

```
OPENAI_API_KEY=your_api_key_here
GEMINI_API_KEY=your_api_key_here
```

## Development

Start the development server on http://localhost:3000:

```bash
npm run dev
```
