import type { DrawResult } from './types.js'
import { TAROT_DECK } from './deck.js'

export interface RNG {
  next(): number
}

/**
 * Creates a seeded pseudo-random number generator for deterministic testing.
 * Uses a simple Linear Congruential Generator (LCG) algorithm.
 */
export function createSeededRNG(seed: number): RNG {
  let state = seed

  return {
    next(): number {
      // LCG parameters (same as java.util.Random)
      state = (state * 1103515245 + 12345) & 0x7fffffff
      return state / 0x7fffffff // Normalize to [0, 1)
    },
  }
}

/**
 * Creates an RNG using Math.random() for production use.
 */
export function createDefaultRNG(): RNG {
  return {
    next(): number {
      return Math.random()
    },
  }
}

/**
 * Draws N unique cards from the tarot deck (no duplicates).
 * Each card has a 50% chance of being reversed.
 *
 * @param count Number of cards to draw (1-10)
 * @param rng Random number generator (for testing with seeds)
 * @returns Array of drawn cards with orientation
 */
export function drawCards(count: number, rng: RNG = createDefaultRNG()): DrawResult {
  // Create pool of available card indices
  const availableIndices = Array.from({ length: TAROT_DECK.length }, (_, i) => i)
  const result: DrawResult = []

  for (let i = 0; i < count; i++) {
    // Pick a random index from remaining available cards
    const randomIndex = Math.floor(rng.next() * availableIndices.length)
    const cardIndex = availableIndices[randomIndex]

    // Remove selected index from pool (ensures uniqueness)
    availableIndices.splice(randomIndex, 1)

    const card = TAROT_DECK[cardIndex]

    // Determine orientation (50/50 upright/reversed)
    const reversed = rng.next() < 0.5

    result.push({ card, reversed })
  }

  return result
}
