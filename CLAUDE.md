# Development Guide for Claude Code

## Project Philosophy

This project follows a **walking skeleton** approach:
- Build the smallest possible end-to-end slice first
- Add features incrementally in small, testable chunks
- Keep the feedback loop fast (< 1 second for tests, < 5 seconds for builds)
- Favor simplicity over premature optimization

## Development Workflow

### Test-First Development
1. **Write the test first** - Define expected behavior before implementation
2. **Run the test** - It should fail (red)
3. **Write minimal code** to make it pass (green)
4. **Refactor** if needed, keeping tests green
5. **Commit** - Small, atomic commits with clear messages

### Fast Feedback Loop
- **`pnpm dev`** - Start dev servers (auto-restart on changes)
- **`pnpm test`** - Run tests in watch mode (only re-runs changed tests)
- **`pnpm build`** - Verify production build works

### Key Principles

**Keep diffs small:**
- One logical change per commit
- Prefer multiple small PRs over one large PR
- Each change should be independently reviewable

**Test behavior, not implementation:**
- Test what the code does, not how it does it
- Tests should validate shape/parseability, not exact values (e.g., timestamps)
- Mock external dependencies (network, time, randomness)

**Avoid premature abstraction:**
- Three strikes rule: extract abstractions after third duplication
- Prefer clear duplication over unclear abstraction
- Delete unused code immediately

**Maintain clear boundaries:**
- `src/client/` - Thin view layer only (easy to swap frameworks later)
- `src/server/` - HTTP routing and request handling
- `src/shared/` - Types and pure logic used by both client and server
- Keep business logic out of UI code

## Project Structure

```
src/
├── client/          # Frontend (vanilla TS for now)
│   ├── api/         # API client layer
│   ├── ui/          # UI/view layer
│   └── *.test.ts    # Colocated tests
├── server/          # Backend (Hono)
│   ├── *.ts         # API routes
│   └── *.test.ts    # Colocated tests
└── shared/          # Shared types and utilities
    └── types.ts
```

## When Adding New Features

1. **Start with a failing test** - Write the test that describes the new behavior
2. **Update types** - Add/modify types in `src/shared/types.ts` if needed
3. **Implement server** - Add API endpoint in `src/server/`
4. **Implement client** - Add UI in `src/client/` (keep it thin!)
5. **Verify end-to-end** - Run `pnpm dev` and manually test in browser
6. **Check tests pass** - `pnpm test` should be green
7. **Verify build** - `pnpm build` should succeed

## Common Tasks

**Add a new API endpoint:**
- Add type to `src/shared/types.ts`
- Write test in `src/server/*.test.ts`
- Implement route in `src/server/index.ts`

**Add UI functionality:**
- Write test in `src/client/*.test.ts` with mocked fetch
- Implement in `src/client/` modules
- Keep state and logic separate from DOM manipulation

**Refactor:**
- Ensure all tests pass before starting
- Keep tests green throughout refactoring
- Commit frequently

## What NOT to Do

❌ Add dependencies without clear justification
❌ Implement features not yet needed
❌ Add frameworks/libraries "just in case"
❌ Write tests that check implementation details
❌ Skip tests because "it's simple"
❌ Make large commits with mixed concerns
❌ Add business logic to client view code

## Continuous Delivery Readiness

Every commit to `main` should:
- ✅ Pass all tests (`pnpm test`)
- ✅ Build successfully (`pnpm build`)
- ✅ Be deployable to production
- ✅ Add or update tests for new behavior

The skeleton is designed so that `dist/` can be deployed anywhere that runs Node.js.
