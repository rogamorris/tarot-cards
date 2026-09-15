# Tarot Cards

A beautiful web application for drawing tarot cards. Choose how many cards to draw, see them revealed with elegant animations, and copy a clean text summary (including upright/reversed orientations) for pasting elsewhere.

**Try it live:** https://rogamorris.github.io/tarot-cards/

## Status

This project is under active development.

**Note:** This project is not currently accepting external contributions.

## Prerequisites

- **Node.js** v20+ ([install](https://nodejs.org/))
- **pnpm** ([install](https://pnpm.io/installation))

## Running Locally

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Start development servers (client on :3000, API on :8787)
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start
```

## Development Approach

This project is built incrementally using:
- **Small vertical slices** - Complete features end-to-end
- **Test-first development** - Tests define expected behavior
- **Fast feedback loops** - Sub-second test runs, quick builds

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines and [docs/architecture.md](./docs/architecture.md) for technical decisions.

## Card Artwork

Card images are the **Rider–Waite–Smith tarot**, illustrated by Pamela Colman
Smith and first published by William Rider & Son in 1909. This artwork is in
the **public domain** (published 1909; the illustrator died in 1951). The files
are fetched from [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck)
by `scripts/download-cards.mjs` — run `pnpm cards` to (re)download the 78
images into `src/client/public/cards/`.

## License

MIT License - see [LICENSE](./LICENSE) for details.
