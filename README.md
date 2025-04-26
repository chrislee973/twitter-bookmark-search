# Twitter Bookmark Search

Liberate your bookmarks! This repo is the code behind https://twitter-bookmark-search.com.

Some features:

- a bookmarklet to scrape your Twitter bookmarks as a json file
- an interface to search your exported bookmarks with custom filters and advanced search operators
- [MCP server](https://modelcontextprotocol.io/introduction) support so you can chat with and analyze your bookmarks in Claude Desktop
  - Follow the instructions in the [claude-plugin](https://www.twitter-bookmark-search.com/claude-plugin) page to export your bookmarks as a sqlite databae and connect it to the MCP server

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

## Development

Start the development server on http://localhost:3000:

```bash
npm run dev
```
