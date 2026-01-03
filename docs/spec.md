# Tarot Cards - Product Specification

## Overview

A web application for drawing tarot cards with visual reveals and exportable results.

**Core Experience:** User selects number of cards → cards reveal with animation → clean text summary for copying (includes upright/reversed orientation).

**Future Enhancement:** Shuffled spread interaction where user picks cards from a visual spread.

## User Stories

**Primary User Need:**
"As a tarot practitioner, I want to draw cards digitally when I don't have a physical deck available, so I can maintain my practice anywhere."

**Core User Story (Slice 1):**
"As a user, I want to choose how many cards to draw (1-10), see them revealed with their orientation, and copy the results as plain text, so I can reflect on the reading and paste it into my journal or notes."

**Future User Story (Slice 2+):**
"As a user, I want to see cards revealed with a nice animation and select cards from a shuffled spread, so the experience feels more engaging and interactive."

## UX / UI (states, interactions, copy)

### States

**1. Idle (initial state)**
- Number input (1-10, default: 1)
- "Draw Cards" button
- Input has `min="1" max="10"` to enforce limits
- Button disabled if input is empty or invalid

**2. Revealed**
- Shows N drawn cards with names and orientation
- Each card displays: name + (upright/reversed)
- "Copy to Clipboard" button
- "Draw Again" button to reset to Idle

**3. Copied (transient feedback)**
- Brief confirmation message: "Copied to clipboard!"
- Returns to Revealed state after ~2 seconds

### Interactions

**Happy Path:**
1. User enters number (1-10) or uses default
2. Clicks "Draw Cards"
3. Cards appear instantly (no animation in Slice 1)
4. User reviews cards
5. Clicks "Copy to Clipboard"
6. Sees "Copied!" confirmation
7. Can paste result elsewhere

**Keyboard Navigation:**
- Tab to number input → Tab to "Draw Cards" → Enter to draw
- Tab to "Copy to Clipboard" → Enter to copy
- Tab to "Draw Again" → Enter to reset

### Copy & Messaging

**Button labels:**
- "Draw Cards" (primary action)
- "Copy to Clipboard" (after draw)
- "Draw Again" (reset)

**Validation:**
- Inline validation via HTML5 `min`/`max` attributes (no error messages needed)

**Copy confirmation:**
- "Copied to clipboard!" (transient, 2-second fade)

## Data Model

### Core Entities

**Deck:** Rider-Waite tarot deck (78 cards)
- 22 Major Arcana (0-21): The Fool, The Magician, The High Priestess, etc.
- 56 Minor Arcana (4 suits × 14 cards): Wands, Cups, Swords, Pentacles

**Card:**
- `id`: unique identifier (e.g., "the-fool", "two-of-cups")
- `name`: display name (e.g., "The Fool", "Two of Cups")
- `suit`: Major Arcana | Wands | Cups | Swords | Pentacles (for filtering/grouping if needed)

**Draw Result:**
- Array of drawn cards with orientation (upright/reversed)
- Format: `[{ card: Card, reversed: boolean }, ...]`
- **Constraints:** Unique cards only (no duplicates), 1-10 cards per draw

### Draw Result Format

**Copy Output (plain text):**
```
1. The Fool (upright)
2. Two of Cups (reversed)
3. The Tower (upright)
```

Simple numbered list with card name and orientation. Users add their own interpretations/context.

## Architecture & Boundaries

### Client Responsibilities
- Draw logic (randomization with seedable RNG for testing)
- Card deck data (static 78-card Rider-Waite list)
- UI state management (selecting N, revealing cards, showing results)
- Copy-to-clipboard functionality
- Animation (when added incrementally)

### Server Responsibilities
- Serve static client bundle
- (Future: could add draw history, analytics, or user preferences)

### Shared Types
- Card interface
- DrawResult interface
- Deck constant (array of 78 cards)

## Testing Strategy

### Unit Tests

**Draw Logic (`drawCards` function):**
- Test with seeded RNG for determinism
- Verify correct number of cards drawn
- Verify uniqueness (no duplicates)
- Verify 50/50 orientation distribution (statistical test with fixed seed)
- Edge cases: draw 1 card, draw 10 cards

**Card Deck:**
- Verify deck has 78 unique cards
- Verify all card objects have required fields (id, name, suit)

### UI/Integration Tests

**Happy Path Render Test:**
- User enters number (e.g., 3)
- Clicks "Draw Cards"
- Verify 3 cards rendered in DOM
- Verify each card shows name + orientation
- Verify "Copy to Clipboard" button appears

**Manual Testing (Slice 1):**
- Keyboard navigation (tab through controls, Enter to activate)
- Copy-paste result into text editor
- Draw again workflow

**Deferred:**
- Full E2E automation (can add later if needed)
- Screen reader testing (Slice 2+)

### Acceptance Criteria

See **Milestones / Slices** section for detailed acceptance criteria per slice.

## Decisions & Tradeoffs

### ✓ Client-side draw logic
**Decision:** All randomness and draw logic happens in the browser.
**Rationale:** Simpler architecture (no API needed), deterministic testing with seeded RNG, faster UX (no network calls).
**Trade-off:** Cannot prevent manipulation or track draw history server-side. Acceptable for MVP.

### ✓ Rider-Waite deck, names only
**Decision:** Use standard 78-card Rider-Waite deck with card names only (no interpretations).
**Rationale:** Minimal data complexity, faster to implement, smaller bundle size, users bring their own interpretations.
**Trade-off:** Less helpful to beginners. Can add keywords/meanings incrementally if desired.

### ✓ Core flow before animation polish
**Decision:** Slice 1 focuses on draw → reveal → copy flow with minimal/no animation.
**Rationale:** Vertical slice approach, ships value faster, animation can be added incrementally.
**Trade-off:** Initial version may feel less polished. Acceptable for early-stage product.

### ✓ Unique cards only, 1-10 draw limit
**Decision:** Each card appears once max per draw (no replacement). Strict 1-10 card limit.
**Rationale:** Matches physical tarot deck behavior. 1-10 covers common spreads (single card, 3-card, Celtic Cross). Simple validation.
**Trade-off:** Can't draw more than 10 cards. Acceptable—most spreads use ≤10 cards.

### ✓ Simple copy format (names + orientation only)
**Decision:** Copied text is a numbered list: "1. Card Name (upright/reversed)"
**Rationale:** Clean, minimal, easy to paste anywhere. Users add their own interpretations.
**Trade-off:** No metadata (timestamp, spread name). Can add incrementally if needed.

### ✓ Inline validation (no error states)
**Decision:** Use HTML5 input validation (`min="1" max="10"`), disable button when invalid.
**Rationale:** Simplest UX, prevents errors at source, no error messaging needed.
**Trade-off:** Less explicit feedback about limits. Acceptable—most users stay within bounds.

### ✓ Keyboard navigation baseline (defer screen readers)
**Decision:** Slice 1 supports keyboard navigation (tab, Enter). Screen reader optimization deferred.
**Rationale:** Baseline accessibility without full ARIA implementation. Can enhance incrementally.
**Trade-off:** Not fully accessible to screen reader users initially. Document in future work.

### ✓ Unit + happy path UI tests (balanced coverage)
**Decision:** Unit tests for draw logic + one happy path render test. Manual testing for full flow.
**Rationale:** Balanced coverage—catches logic bugs and basic render issues without heavy test maintenance.
**Trade-off:** Less E2E automation. Acceptable for small project with frequent manual testing.

### ✓ Digital deck for practice (user need)
**Decision:** Primary user need is practicing tarot without physical deck.
**Rationale:** Focuses product on being a faithful digital equivalent of physical deck behavior (unique cards, proper orientations, clean export).
**Implication:** Prioritize matching real-world tarot experience over gamification or social features.

## Milestones / Slices

### Walking Skeleton: 1-Card Draw + Copy

**Goal:** Simplest complete end-to-end flow with real deck and working copy functionality.

**Scope:**
- Hardcoded 1-card draw (no user input for count yet)
- Real 78-card Rider-Waite deck data
- Random draw with orientation (upright/reversed)
- Display card name + orientation in UI
- "Copy to Clipboard" button with working copy functionality
- Unit tests for draw logic (seeded RNG)

**Success Criteria:**
- ✅ Page loads and shows "Draw a Card" button
- ✅ Click button → single card appears with name + orientation
- ✅ "Copy to Clipboard" appears
- ✅ Click copy → text in clipboard: "1. [Card Name] (upright/reversed)"
- ✅ Tests pass: draw function returns 1 card, orientation is boolean, card is from deck

**What's NOT in walking skeleton:**
- Number input (hardcoded to 1)
- "Draw Again" button (refresh page to draw again)
- Uniqueness enforcement (only drawing 1 card)
- Copied confirmation message

---

### Slice 1: N-Card Selection + Uniqueness

**Goal:** Add user control over draw count and ensure unique cards.

**Scope:**
- Number input (1-10) with HTML5 validation
- "Draw Cards" button (replaces "Draw a Card")
- Draw N unique cards (no duplicates)
- "Draw Again" button to reset state
- "Copied to clipboard!" transient confirmation (2 seconds)
- Happy path UI render test

**Success Criteria:**
- ✅ User can enter 1-10 in number input (default: 1)
- ✅ Input validation prevents <1 or >10
- ✅ Button disabled when input invalid
- ✅ Draw N cards → all unique (no duplicates)
- ✅ Each card shows name + orientation
- ✅ Copy button works, shows "Copied!" confirmation
- ✅ "Draw Again" resets to idle state
- ✅ Keyboard navigation works (tab, Enter)
- ✅ Unit tests verify uniqueness + edge cases (1 card, 10 cards)
- ✅ UI render test verifies cards appear in DOM

**What's NOT in Slice 1:**
- Animation on reveal
- Shuffled spread selection
- ARIA labels / screen reader support
- Card meanings or interpretations

---

### Slice 2: Visual Polish + Animation

**Scope:**
- Card reveal animation (e.g., flip, fade-in)
- Smooth transitions between states
- Visual design improvements (card styling, layout)
- Loading states if needed

---

### Slice 3: Shuffled Spread Interaction (optional)

**Scope:**
- Show face-down card spread (N cards)
- User clicks cards to reveal them one by one
- Selected cards highlight
- Copy final selection

---

### Slice 4: Enhanced Accessibility

**Scope:**
- ARIA labels and roles
- Screen reader announcements
- Focus management
- Keyboard shortcuts (e.g., Escape to reset)

---

### Slice 5: Card Meanings (optional)

**Scope:**
- Add brief keywords or full meanings to card data
- Display meanings alongside card names
- Include in copy output (optional formatting)
