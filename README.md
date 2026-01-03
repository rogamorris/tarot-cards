# Tarot Cards

A web application for drawing tarot cards. Choose how many cards to draw, see them revealed with simple animations, and copy a clean text summary (including upright/reversed orientations) for pasting elsewhere.

## Status

This project is in **early-stage development** and under active development. The current implementation is a walking skeleton demonstrating the architecture and development workflow. Tarot card functionality is not yet implemented.

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

## License

MIT License - see [LICENSE](./LICENSE) for details.
