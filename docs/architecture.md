# Architecture

## High-Level Structure

```
┌─────────────────────────────────────────┐
│          Browser (Client)               │
│  ┌─────────────────────────────────┐    │
│  │  Vanilla TypeScript UI          │    │
│  │  (thin view layer)              │    │
│  └─────────────────────────────────┘    │
└─────────────────┬───────────────────────┘
                  │ HTTP
                  ▼
┌─────────────────────────────────────────┐
│          Hono Server                    │
│  ┌──────────────┐   ┌──────────────┐   │
│  │  API Routes  │   │ Static Files │   │
│  │  /api/*      │   │ (production) │   │
│  └──────────────┘   └──────────────┘   │
└─────────────────────────────────────────┘
```

## Module Boundaries

### `src/client/`
- Thin UI layer (view code only)
- No state management or business logic yet
- Calls `/api/*` endpoints
- Easy to replace with React/Vue/Svelte later

### `src/server/`
- Hono HTTP server
- Handles API routes (`/api/*`)
- In production: serves static client files from `dist/public/`

### `src/shared/`
- TypeScript types used by both client and server
- Ensures type safety across the boundary
- Currently: `PingResponse` type

## Development Model

**Dev Mode** (`pnpm dev`):
- **Vite dev server** (port 3000) serves client with HMR
- **Hono server** (port 8787) handles `/api/*` routes
- Vite proxies `/api/*` → `http://localhost:8787`
- Both run concurrently via `concurrently`

**Production Mode** (`pnpm build && pnpm start`):
- Vite builds client → `dist/public/`
- TypeScript compiles server → `dist/server/`
- Single Hono server serves both API and static files
- Deploy single artifact (everything in `dist/`)

## Key Tradeoffs

| Decision | Rationale | Tradeoff |
|----------|-----------|----------|
| **Hono** | Lightweight, fast, good DX | Less ecosystem than Express |
| **Vanilla TS client** | Zero abstractions, easy migration | Manual DOM updates (fine for now) |
| **Colocated tests** | Faster to write/find tests | Slightly larger file count |
| **Vite + Vitest** | Unified toolchain, fast HMR | Newer than webpack/Jest |
| **pnpm** | Faster installs, strict deps | Less common than npm |
| **Monorepo-in-one** | Simple setup, shared types | May need splitting later |

## Testing Strategy

- **Unit tests**: Colocated with code (`*.test.ts`)
- **API tests**: Test Hono routes directly (no HTTP server needed)
- **Client tests**: Test logic with mocked fetch
- **Test environment**: happy-dom for lightweight DOM simulation (faster than jsdom)
- **E2E tests**: Deferred until needed

## Future Expansion Points

When adding real features:
1. Add domain logic to `src/shared/` or new `src/domain/` directory
2. Keep client as thin wrapper over domain logic
3. Add database/storage when persistence is needed
4. Introduce framework (React/etc.) when UI complexity warrants it
