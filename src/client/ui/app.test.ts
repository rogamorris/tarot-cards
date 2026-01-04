import { describe, it, expect } from 'vitest'
import { renderDrawButton, renderDrawResult, formatDrawForCopy } from './app.js'
import type { DrawResult } from '../../shared/types.js'

describe('renderDrawButton', () => {
  it('renders draw button', () => {
    const container = document.createElement('div')
    renderDrawButton(container)

    const button = container.querySelector('#draw-button')
    expect(button).toBeTruthy()
    expect(button?.textContent).toBe('Draw Cards')
  })

  it('renders number input with validation', () => {
    const container = document.createElement('div')
    renderDrawButton(container)

    const input = container.querySelector('#card-count') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input?.type).toBe('number')
    expect(input?.min).toBe('1')
    expect(input?.max).toBe('10')
    expect(input?.value).toBe('1')
  })

  it('includes title', () => {
    const container = document.createElement('div')
    renderDrawButton(container)

    expect(container.textContent).toContain('Tarot Cards')
  })
})

describe('renderDrawResult', () => {
  it('displays card name and orientation', () => {
    const container = document.createElement('div')
    const draw: DrawResult = [
      {
        card: { id: 'the-fool', name: 'The Fool', suit: 'Major Arcana' },
        reversed: false,
      },
    ]

    renderDrawResult(container, draw)

    expect(container.textContent).toContain('The Fool')
    expect(container.textContent).toContain('upright')
  })

  it('displays reversed orientation', () => {
    const container = document.createElement('div')
    const draw: DrawResult = [
      {
        card: { id: 'the-tower', name: 'The Tower', suit: 'Major Arcana' },
        reversed: true,
      },
    ]

    renderDrawResult(container, draw)

    expect(container.textContent).toContain('The Tower')
    expect(container.textContent).toContain('reversed')
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
    expect(copyButton?.textContent).toBe('Copy to Clipboard')
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
    expect(drawAgainButton?.textContent).toBe('Draw Again')
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

    expect(container.textContent).toContain('The Fool')
    expect(container.textContent).toContain('upright')
    expect(container.textContent).toContain('The Tower')
    expect(container.textContent).toContain('reversed')
    expect(container.textContent).toContain('The Star')
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
