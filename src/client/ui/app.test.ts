import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderDrawButton, renderDrawResult, renderShuffleView, renderFanView, toggleSelection, dealFanCards, flyCardsToSpread, formatDrawForCopy, cardImageUrl } from './app.js'
import { TAROT_DECK } from '../../shared/deck.js'
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

describe('toggleSelection', () => {
  it('adds a card when under the limit', () => {
    expect(toggleSelection([], 'the-fool', 3)).toEqual(['the-fool'])
  })

  it('removes a card that is already selected', () => {
    expect(toggleSelection(['the-fool', 'the-tower'], 'the-fool', 3)).toEqual(['the-tower'])
  })

  it('does not add beyond the limit', () => {
    const selected = ['a', 'b', 'c']
    expect(toggleSelection(selected, 'd', 3)).toEqual(['a', 'b', 'c'])
  })

  it('does not mutate the input array', () => {
    const selected = ['the-fool']
    toggleSelection(selected, 'the-tower', 3)
    expect(selected).toEqual(['the-fool'])
  })
})

describe('renderShuffleView', () => {
  it('renders the shuffling deck visual and status', () => {
    const container = document.createElement('div')
    renderShuffleView(container, 3)

    expect(container.querySelector('.shuffle-stage')).toBeTruthy()
    expect(container.querySelectorAll('.deck-layer')).toHaveLength(3)
    expect(container.textContent).toContain('Shuffling')
  })
})

describe('renderFanView', () => {
  it('renders one face-down card per deck card', () => {
    const container = document.createElement('div')
    renderFanView(container, 3)

    expect(container.querySelectorAll('.fan-card')).toHaveLength(78)
  })

  it('starts with zero chosen and the confirm button hidden', () => {
    const container = document.createElement('div')
    renderFanView(container, 3)

    expect(container.querySelector('#fan-count')?.textContent).toContain('0 of 3')
    expect(container.querySelector('#reveal-button')?.hasAttribute('hidden')).toBe(true)
  })

  it('selects a card when tapped and updates the count', () => {
    const container = document.createElement('div')
    renderFanView(container, 3)

    const card = container.querySelector('.fan-card') as HTMLButtonElement
    card.click()

    expect(card.closest('.fan-card-pos')?.classList.contains('is-selected')).toBe(true)
    expect(card.getAttribute('aria-pressed')).toBe('true')
    expect(container.querySelector('#fan-count')?.textContent).toContain('1 of 3')
  })

  it('deselects a selected card when tapped again', () => {
    const container = document.createElement('div')
    renderFanView(container, 3)

    const card = container.querySelector('.fan-card') as HTMLButtonElement
    card.click()
    card.click()

    expect(card.closest('.fan-card-pos')?.classList.contains('is-selected')).toBe(false)
    expect(container.querySelector('#fan-count')?.textContent).toContain('0 of 3')
  })

  it('shows the reveal button once the requested count is chosen', () => {
    const container = document.createElement('div')
    renderFanView(container, 2)

    const cards = container.querySelectorAll('.fan-card')
    ;(cards[0] as HTMLButtonElement).click()
    expect(container.querySelector('#reveal-button')?.hasAttribute('hidden')).toBe(true)
    ;(cards[1] as HTMLButtonElement).click()
    expect(container.querySelector('#reveal-button')?.hasAttribute('hidden')).toBe(false)
    expect(container.querySelector('#fan-count')?.textContent).toContain('2 of 2')
  })

  it('does not select more cards than requested', () => {
    const container = document.createElement('div')
    renderFanView(container, 1)

    const cards = container.querySelectorAll('.fan-card')
    ;(cards[0] as HTMLButtonElement).click()
    ;(cards[1] as HTMLButtonElement).click()

    expect(container.querySelectorAll('.fan-card-pos.is-selected')).toHaveLength(1)
    expect(container.querySelector('#fan-count')?.textContent).toContain('1 of 1')
  })

  it('positions each card at its own angle around the circle', () => {
    const container = document.createElement('div')
    renderFanView(container, 3)

    const positions = container.querySelectorAll<HTMLElement>('.fan-card-pos')
    const angles = new Set(
      Array.from(positions).map((p) => p.style.getPropertyValue('--angle')),
    )
    expect(angles.size).toBe(78)
  })
})

describe('reveal all', () => {
  it('renders a Reveal All button before Draw Again', () => {
    const container = document.createElement('div')
    renderDrawResult(container, [
      { card: TAROT_DECK[0], reversed: false },
      { card: TAROT_DECK[1], reversed: true },
    ])

    const buttons = Array.from(container.querySelectorAll('.btn-group .btn')).map(
      (b) => b.id,
    )
    expect(buttons).toContain('reveal-all-button')
    expect(buttons.indexOf('reveal-all-button')).toBeLessThan(
      buttons.indexOf('draw-again-button'),
    )
  })

  it('flips every card, updates progress, and swaps buttons', () => {
    const container = document.createElement('div')
    renderDrawResult(container, [
      { card: TAROT_DECK[0], reversed: false },
      { card: TAROT_DECK[1], reversed: true },
    ])

    const revealAll = container.querySelector('#reveal-all-button') as HTMLButtonElement
    revealAll.click()

    expect(container.querySelectorAll('.card-flip.is-flipped')).toHaveLength(2)
    expect(container.textContent).toContain('All cards revealed')
    expect(container.querySelector('#copy-button')?.hasAttribute('hidden')).toBe(false)
    expect(container.querySelector('#reveal-all-button')?.hasAttribute('hidden')).toBe(true)
  })
})

describe('fan deal animation', () => {
  it('gives each card its own deal index', () => {
    const container = document.createElement('div')
    renderFanView(container, 3)

    const positions = container.querySelectorAll<HTMLElement>('.fan-card-pos')
    const indices = Array.from(positions).map((p) =>
      p.style.getPropertyValue('--i').trim(),
    )
    expect(indices).toHaveLength(78)
    expect(new Set(indices).size).toBe(78)
  })

  it('starts undealt and deals on demand', () => {
    const container = document.createElement('div')
    renderFanView(container, 3)

    const stage = container.querySelector('.fan-stage') as HTMLElement
    expect(stage.classList.contains('is-dealt')).toBe(false)

    dealFanCards(stage)
    expect(stage.classList.contains('is-dealt')).toBe(true)
  })
})

describe('fan deal order', () => {
  const dealEntries = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>('.fan-card-pos')).map((p) => ({
      rank: p.style.getPropertyValue('--i').trim(),
      angle: parseFloat(p.style.getPropertyValue('--angle')),
    }))

  const sin = (angle: number) => Math.sin((angle * Math.PI) / 180)

  it('starts the deal at the leftmost card', () => {
    const container = document.createElement('div')
    renderFanView(container, 3)

    const entries = dealEntries(container)
    const leftmost = entries.reduce((a, b) => (sin(a.angle) < sin(b.angle) ? a : b))
    expect(leftmost.rank).toBe('0')
  })

  it('deals monotonically left-to-right across the ring', () => {
    const container = document.createElement('div')
    renderFanView(container, 3)

    const sins = dealEntries(container)
      .sort((a, b) => parseInt(a.rank, 10) - parseInt(b.rank, 10))
      .map((e) => sin(e.angle))

    // The horizontal position never moves right-to-left as the deal
    // progresses (within floating-point noise for symmetric cards).
    for (let k = 1; k < sins.length; k++) {
      expect(sins[k]).toBeGreaterThanOrEqual(sins[k - 1] - 1e-9)
    }
    expect(new Set(dealEntries(container).map((e) => e.rank)).size).toBe(78)
  })
})

describe('spread entrance', () => {
  const fakeRect = (x: number, y: number, w: number, h: number) =>
    ({ left: x, top: y, width: w, height: h }) as DOMRect

  const makeSlots = (count: number) => {
    const stubs = Array.from({ length: count }, () => vi.fn())
    const slots = stubs.map((stub) => {
      const el = document.createElement('div')
      ;(el as unknown as { animate: unknown }).animate = stub
      return el
    })
    return { slots, stubs }
  }

  it('flies each slot from its fan position to its spread position', () => {
    const { slots, stubs } = makeSlots(2)
    const from = [fakeRect(10, 20, 54, 93), fakeRect(300, 20, 54, 93)]

    flyCardsToSpread(slots, from)

    expect(stubs[0]).toHaveBeenCalledTimes(1)
    const [keyframes, options] = stubs[0].mock.calls[0]
    expect(keyframes[0].transform).toContain('translate(')
    expect(keyframes[0].transform).toContain('scale(')
    expect(keyframes[1].transform).toBe('translate(0px, 0px) scale(1)')
    expect(options.delay).toBe(0)
    expect(stubs[1].mock.calls[0][1].delay).toBeGreaterThan(0)
  })

  it('skips the flight when reduced motion is preferred', () => {
    const original = window.matchMedia
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia
    try {
      const { slots, stubs } = makeSlots(2)
      flyCardsToSpread(slots, [fakeRect(0, 0, 54, 93), fakeRect(0, 0, 54, 93)])
      expect(stubs[0]).not.toHaveBeenCalled()
      expect(stubs[1]).not.toHaveBeenCalled()
    } finally {
      window.matchMedia = original
    }
  })
})
