# Development Guide for Claude Code

## Project Philosophy

This project is developed in the open on GitHub using continuous delivery practices:
- Build features end-to-end in small vertical slices
- Commit frequently with shippable progress at each step
- Keep `main` always working, buildable, and deployable
- Optimize for fast feedback and low-risk changes
- Favor simplicity over premature optimization

**Working in public:** All code is developed openly on GitHub. Write clear commit messages, keep diffs small, and assume your work will be read by others.

## Development Workflow

### Test-First Development
1. **Write the test first** - Define expected behavior before implementation
2. **Run the test** - It should fail (red)
3. **Write minimal code** to make it pass (green)
4. **Refactor** if needed, keeping tests green
5. **Commit** - Small, atomic commits with clear messages

### Fast Feedback Loop
- **`pnpm dev`** - Start dev servers (auto-restart on changes)
- **`pnpm test:watch`** - Run tests in watch mode (only re-runs changed tests)
- **`pnpm test`** - Run all tests once (CI mode)
- **`pnpm build`** - Verify production build works

### Key Principles

**Make small, frequent commits:**
- Commit after each meaningful step (test passes, feature works, refactor complete)
- One logical change per commit with a clear message
- Prefer many small commits over batched work
- Each commit should leave the code in a working state

**Build vertical slices:**
- Complete features end-to-end (UI → API → test) rather than horizontal layers
- Each slice should add visible, testable value
- Avoid scaffolding or refactoring that doesn't ship functionality

**Test behavior, not implementation:**
- Test what the code does, not how it does it
- Tests should validate shape/parseability, not exact values (e.g., timestamps)
- Mock external dependencies (network, time, randomness)

**Ask before making large changes:**
- Large refactors, dependency additions, or architectural shifts require explicit approval
- When in doubt, propose the approach before implementing
- Irreversible changes (deletions, migrations) need user confirmation

**Write for a public audience:**
- Code will be pushed to GitHub and read by others
- Keep diffs clear and focused
- Use descriptive names and comments where logic isn't obvious
- Commit messages should explain what changed and why

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

❌ Make large, batched commits — commit frequently instead
❌ Build horizontal layers without shipping end-to-end value
❌ Add dependencies without clear justification
❌ Implement features not yet needed
❌ Skip tests because "it's simple"
❌ Leave the code in a broken or non-buildable state
❌ Make large refactors without asking first
❌ Add business logic to client view code

## Continuous Delivery Readiness

Every commit to `main` should:
- ✅ Pass all tests (`pnpm test`)
- ✅ Build successfully (`pnpm build`)
- ✅ Be deployable to production
- ✅ Add or update tests for new behavior

The skeleton is designed so that `dist/` can be deployed anywhere that runs Node.js.
