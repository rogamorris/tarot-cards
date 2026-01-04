import { describe, it, expect } from 'vitest'
import { drawCards, createSeededRNG } from './draw.js'
import { TAROT_DECK } from './deck.js'

describe('drawCards', () => {
  it('draws exactly 1 card', () => {
    const rng = createSeededRNG(42)
    const result = drawCards(1, rng)

    expect(result).toHaveLength(1)
  })

  it('returns a card from the deck', () => {
    const rng = createSeededRNG(42)
    const result = drawCards(1, rng)

    const cardIds = TAROT_DECK.map(c => c.id)
    expect(cardIds).toContain(result[0].card.id)
  })

  it('includes orientation (reversed boolean)', () => {
    const rng = createSeededRNG(42)
    const result = drawCards(1, rng)

    expect(typeof result[0].reversed).toBe('boolean')
  })

  it('produces deterministic results with same seed', () => {
    const rng1 = createSeededRNG(123)
    const result1 = drawCards(1, rng1)

    const rng2 = createSeededRNG(123)
    const result2 = drawCards(1, rng2)

    expect(result1[0].card.id).toBe(result2[0].card.id)
    expect(result1[0].reversed).toBe(result2[0].reversed)
  })

  it('produces different results with different seeds', () => {
    const rng1 = createSeededRNG(100)
    const result1 = drawCards(1, rng1)

    const rng2 = createSeededRNG(200)
    const result2 = drawCards(1, rng2)

    // Statistically should be different (not guaranteed but highly likely)
    const isDifferent =
      result1[0].card.id !== result2[0].card.id ||
      result1[0].reversed !== result2[0].reversed

    expect(isDifferent).toBe(true)
  })

  it('draws N unique cards (no duplicates)', () => {
    const rng = createSeededRNG(42)
    const result = drawCards(5, rng)

    expect(result).toHaveLength(5)

    // Check all cards are unique
    const cardIds = result.map(r => r.card.id)
    const uniqueIds = new Set(cardIds)
    expect(uniqueIds.size).toBe(5)
  })

  it('handles edge case: draw 1 card', () => {
    const rng = createSeededRNG(123)
    const result = drawCards(1, rng)

    expect(result).toHaveLength(1)
    expect(result[0].card).toBeDefined()
    expect(typeof result[0].reversed).toBe('boolean')
  })

  it('handles edge case: draw 10 cards', () => {
    const rng = createSeededRNG(456)
    const result = drawCards(10, rng)

    expect(result).toHaveLength(10)

    // All cards unique
    const cardIds = result.map(r => r.card.id)
    const uniqueIds = new Set(cardIds)
    expect(uniqueIds.size).toBe(10)
  })
})
