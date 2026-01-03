# Project Specification

## Problem Framing

This is a **walking skeleton** — a minimal end-to-end implementation that validates the build, test, and deployment pipeline without real business logic.

## Purpose

- Establish development workflow (test-first, fast feedback, incremental delivery)
- Validate toolchain (TypeScript, Vite, Hono, Vitest)
- Prove the client ↔ server integration works
- Create a foundation for adding features incrementally

## Current Scope

### What's Included
- Single API endpoint: `GET /api/ping` returns status + timestamp
- Vanilla TypeScript client that calls `/api/ping` and displays result
- Automated tests for both client and server
- Dev mode with hot reload (client) and auto-restart (server)
- Production build that bundles everything into a single deployable artifact

### What's Explicitly Out of Scope (For Now)
- Real business logic
- Database or external dependencies
- Authentication/authorization
- Complex UI framework (React/Vue/Svelte)
- End-to-end browser tests
- CI/CD pipeline configuration
- Deployment automation

## Success Criteria

The skeleton is complete when:
1. `pnpm install && pnpm test && pnpm build` succeeds
2. `pnpm dev` runs client + server with live reload
3. Browser shows API ping response
4. All tests pass and validate behavior (not implementation details)

## Development Workflow

This project is developed and shared on GitHub using continuous delivery practices.

### Work in Small Slices

- Build features end-to-end in small vertical slices
- Each slice adds testable, visible value
- Avoid large horizontal rewrites or scaffolding
- Ship complete functionality incrementally

### Commit Frequently

- Commit after each meaningful step (test passes, feature works, refactor complete)
- Prefer many small commits over large batches
- Each commit should represent shippable progress, not partial work
- Write clear commit messages that explain what and why

### Keep Main Green

- `main` branch must always build and pass all tests
- Features are added incrementally via frequent, small commits to `main`
- Avoid long-lived feature branches that drift from `main`
- CI runs on every push to verify the build stays healthy

### Why This Approach

**Fast feedback:** Small changes mean quick test runs and rapid validation
**Low risk:** Small commits are easy to understand, review, and revert if needed
**Continuous delivery:** Every commit leaves the project in a deployable state
**Public accountability:** Code is developed in the open with readable history
