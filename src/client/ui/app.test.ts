import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderDrawButton, renderDrawResult, formatDrawForCopy, cardImageUrl } from './app.js'
import type { Card, DrawResult } from '../../shared/types.js'

describe('cardImageUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('maps a major arcana card to its artwork file', () => {
    const card: Card = { id: 'the-fool', name: 'The Fool', suit: 'Major Arcana' }

    expect(cardImageUrl(card).endsWith('cards/the-fool.jpg')).toBe(true)
  })

  it('maps a minor arcana card to its artwork file', () => {
    const card: Card = { id: 'ace-of-cups', name: 'Ace of Cups', suit: 'Cups' }

    expect(cardImageUrl(card).endsWith('cards/ace-of-cups.jpg')).toBe(true)
  })

  it('prefixes the artwork path with the Vite base path', () => {
    vi.stubEnv('BASE_URL', '/tarot-cards/')
    const card: Card = { id: 'the-fool', name: 'The Fool', suit: 'Major Arcana' }

    expect(cardImageUrl(card)).toBe('/tarot-cards/cards/the-fool.jpg')
  })
})

describe('renderDrawButton', () => {
  it('renders draw button', () => {
    const container = document.createElement('div')
    renderDrawButton(container)

    const button = container.querySelector('#draw-button')
    expect(button).toBeTruthy()
    expect(button?.textContent?.trim()).toBe('Draw Cards')
  })

  it('renders number input with validation', () => {
    const container = document.createElement('div')
    renderDrawButton(container)

    const input = container.querySelector('#card-count') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input?.type).toBe('number')
    expect(input?.min).toBe('1')
    expect(input?.max).toBe('10')
    // Default value is 3 (common 3-card spread)
    expect(input?.value).toBe('3')
  })

  it('includes title', () => {
    const container = document.createElement('div')
    renderDrawButton(container)

    expect(container.textContent).toContain('Tarot Cards')
  })
})

describe('renderDrawResult', () => {
  it('labels each card with its name and orientation for assistive tech', () => {
    const container = document.createElement('div')
    const draw: DrawResult = [
      {
        card: { id: 'the-fool', name: 'The Fool', suit: 'Major Arcana' },
        reversed: false,
      },
    ]

    renderDrawResult(container, draw)

    const button = container.querySelector('.card-flip')
    expect(button?.getAttribute('aria-label')).toContain('The Fool')
    expect(button?.getAttribute('aria-label')).toContain('upright')
  })

  it('labels reversed cards with their orientation', () => {
    const container = document.createElement('div')
    const draw: DrawResult = [
      {
        card: { id: 'the-tower', name: 'The Tower', suit: 'Major Arcana' },
        reversed: true,
      },
    ]

    renderDrawResult(container, draw)

    const button = container.querySelector('.card-flip')
    expect(button?.getAttribute('aria-label')).toContain('The Tower')
    expect(button?.getAttribute('aria-label')).toContain('reversed')
  })

  it('renders the card artwork image on the front face', () => {
    const container = document.createElement('div')
    const draw: DrawResult = [
      {
        card: { id: 'the-fool', name: 'The Fool', suit: 'Major Arcana' },
        reversed: false,
      },
      {
        card: { id: 'ace-of-cups', name: 'Ace of Cups', suit: 'Cups' },
        reversed: true,
      },
    ]

    renderDrawResult(container, draw)

    const images = container.querySelectorAll('.card-face--front img.card-art')
    expect(images).toHaveLength(2)
    expect((images[0] as HTMLImageElement).src.endsWith('cards/the-fool.jpg')).toBe(true)
    expect((images[1] as HTMLImageElement).src.endsWith('cards/ace-of-cups.jpg')).toBe(true)
    // Decorative: the button's aria-label already names the card
    images.forEach((img) => expect((img as HTMLImageElement).alt).toBe(''))
  })

  it('includes copy button', () => {
    const container = document.createElement('div')
    const draw: DrawResult = [
      {
        card: { id: 'the-fool', name: 'The Fool', suit: 'Major Arcana' },
        reversed: false,
      },
    ]

    renderDrawResult(container, draw)

    const copyButton = container.querySelector('#copy-button')
    expect(copyButton).toBeTruthy()
    expect(copyButton?.textContent?.trim()).toBe('Copy to Clipboard')
  })

  it('includes draw again button', () => {
    const container = document.createElement('div')
    const draw: DrawResult = [
      {
        card: { id: 'the-fool', name: 'The Fool', suit: 'Major Arcana' },
        reversed: false,
      },
    ]

    renderDrawResult(container, draw)

    const drawAgainButton = container.querySelector('#draw-again-button')
    expect(drawAgainButton).toBeTruthy()
    expect(drawAgainButton?.textContent?.trim()).toBe('Draw Again')
  })

  it('renders multiple cards', () => {
    const container = document.createElement('div')
    const draw: DrawResult = [
      {
        card: { id: 'the-fool', name: 'The Fool', suit: 'Major Arcana' },
        reversed: false,
      },
      {
        card: { id: 'the-tower', name: 'The Tower', suit: 'Major Arcana' },
        reversed: true,
      },
      {
        card: { id: 'the-star', name: 'The Star', suit: 'Major Arcana' },
        reversed: false,
      },
    ]

    renderDrawResult(container, draw)

    const labels = Array.from(container.querySelectorAll('.card-flip')).map((button) =>
      button.getAttribute('aria-label'),
    )
    expect(labels).toHaveLength(3)
    expect(labels[0]).toContain('The Fool')
    expect(labels[0]).toContain('upright')
    expect(labels[1]).toContain('The Tower')
    expect(labels[1]).toContain('reversed')
    expect(labels[2]).toContain('The Star')
  })

  it('staggers card reveal with a per-card delay', () => {
    const container = document.createElement('div')
    const draw: DrawResult = [
      {
        card: { id: 'the-fool', name: 'The Fool', suit: 'Major Arcana' },
        reversed: false,
      },
      {
        card: { id: 'the-tower', name: 'The Tower', suit: 'Major Arcana' },
        reversed: true,
      },
      {
        card: { id: 'the-star', name: 'The Star', suit: 'Major Arcana' },
        reversed: false,
      },
    ]

    renderDrawResult(container, draw)

    const cards = container.querySelectorAll<HTMLElement>('.card-item')
    expect(cards).toHaveLength(3)
    expect(cards[0].style.getPropertyValue('--card-delay')).toBe('0ms')
    expect(cards[1].style.getPropertyValue('--card-delay')).toBe('80ms')
    expect(cards[2].style.getPropertyValue('--card-delay')).toBe('160ms')
  })

  it('renders a face-down back and a front face for each card', () => {
    const container = document.createElement('div')
    const draw: DrawResult = [
      {
        card: { id: 'the-fool', name: 'The Fool', suit: 'Major Arcana' },
        reversed: false,
      },
      {
        card: { id: 'the-tower', name: 'The Tower', suit: 'Major Arcana' },
        reversed: true,
      },
    ]

    renderDrawResult(container, draw)

    expect(container.querySelectorAll('.card-face--back')).toHaveLength(2)
    expect(container.querySelectorAll('.card-face--front')).toHaveLength(2)
  })

  it('marks reversed card fronts to display upside-down', () => {
    const container = document.createElement('div')
    const draw: DrawResult = [
      {
        card: { id: 'the-tower', name: 'The Tower', suit: 'Major Arcana' },
        reversed: true,
      },
    ]

    renderDrawResult(container, draw)

    const front = container.querySelector('.card-face--front')
    expect(front?.classList.contains('is-reversed')).toBe(true)
  })

  it('does not mark upright card fronts as reversed', () => {
    const container = document.createElement('div')
    const draw: DrawResult = [
      {
        card: { id: 'the-fool', name: 'The Fool', suit: 'Major Arcana' },
        reversed: false,
      },
    ]

    renderDrawResult(container, draw)

    const front = container.querySelector('.card-face--front')
    expect(front?.classList.contains('is-reversed')).toBe(false)
  })

  it('starts with all cards face-down and copy hidden', () => {
    const container = document.createElement('div')
    const draw: DrawResult = [
      {
        card: { id: 'the-fool', name: 'The Fool', suit: 'Major Arcana' },
        reversed: false,
      },
      {
        card: { id: 'the-tower', name: 'The Tower', suit: 'Major Arcana' },
        reversed: true,
      },
    ]

    renderDrawResult(container, draw)

    expect(container.querySelectorAll('.card-flip.is-flipped')).toHaveLength(0)
    const copyButton = container.querySelector('#copy-button')
    expect(copyButton?.hasAttribute('hidden')).toBe(true)
    expect(container.textContent).toContain('Tap a card to reveal it')
  })

  it('reveals a card when tapped', () => {
    const container = document.createElement('div')
    const draw: DrawResult = [
      {
        card: { id: 'the-fool', name: 'The Fool', suit: 'Major Arcana' },
        reversed: false,
      },
      {
        card: { id: 'the-tower', name: 'The Tower', suit: 'Major Arcana' },
        reversed: true,
      },
    ]

    renderDrawResult(container, draw)

    const firstCard = container.querySelector('.card-flip') as HTMLButtonElement
    firstCard.click()

    expect(firstCard.classList.contains('is-flipped')).toBe(true)
    expect(container.textContent).toContain('1 of 2 revealed')
  })

  it('shows the copy button once all cards are revealed', () => {
    const container = document.createElement('div')
    const draw: DrawResult = [
      {
        card: { id: 'the-fool', name: 'The Fool', suit: 'Major Arcana' },
        reversed: false,
      },
      {
        card: { id: 'the-tower', name: 'The Tower', suit: 'Major Arcana' },
        reversed: true,
      },
    ]

    renderDrawResult(container, draw)

    const cards = container.querySelectorAll<HTMLButtonElement>('.card-flip')
    cards.forEach((card) => card.click())

    const copyButton = container.querySelector('#copy-button')
    expect(copyButton?.hasAttribute('hidden')).toBe(false)
    expect(container.textContent).toContain('All cards revealed')
  })
})

describe('formatDrawForCopy', () => {
  it('formats single card correctly', () => {
    const draw: DrawResult = [
      {
        card: { id: 'the-fool', name: 'The Fool', suit: 'Major Arcana' },
        reversed: false,
      },
    ]

    const result = formatDrawForCopy(draw)

    expect(result).toBe('1. The Fool (upright)')
  })

  it('formats reversed card correctly', () => {
    const draw: DrawResult = [
      {
        card: { id: 'the-tower', name: 'The Tower', suit: 'Major Arcana' },
        reversed: true,
      },
    ]

    const result = formatDrawForCopy(draw)

    expect(result).toBe('1. The Tower (reversed)')
  })

  it('formats multiple cards correctly', () => {
    const draw: DrawResult = [
      {
        card: { id: 'the-fool', name: 'The Fool', suit: 'Major Arcana' },
        reversed: false,
      },
      {
        card: { id: 'the-tower', name: 'The Tower', suit: 'Major Arcana' },
        reversed: true,
      },
      {
        card: { id: 'the-star', name: 'The Star', suit: 'Major Arcana' },
        reversed: false,
      },
    ]

    const result = formatDrawForCopy(draw)

    expect(result).toBe(
      '1. The Fool (upright)\n2. The Tower (reversed)\n3. The Star (upright)'
    )
  })
})
