import type { Card, DrawResult } from '../../shared/types.js'
import { drawCards } from '../../shared/draw.js'

let currentDraw: DrawResult | null = null

/**
 * URL of the card's artwork image. Images live in the Vite public dir at
 * `cards/<card-id>.jpg` (see scripts/download-cards.mjs), so they are served
 * relative to the app's base path.
 */
export function cardImageUrl(card: Card): string {
  const base = import.meta.env.BASE_URL ?? '/'
  return `${base}cards/${card.id}.jpg`
}

export function renderDrawButton(container: HTMLElement): void {
  container.innerHTML = `
    <div class="app-container">
      <header>
        <h1 class="title">Tarot Cards</h1>
        <p class="subtitle">Draw your cards</p>
      </header>

      <div class="input-group">
        <label class="input-label" for="card-count">Number of cards to draw</label>
        <div class="input-wrapper">
          <input
            type="number"
            id="card-count"
            class="input-field"
            min="1"
            max="10"
            value="3"
            placeholder="1-10"
            aria-describedby="card-count-hint"
          />
        </div>
        <p id="card-count-hint" class="input-hint">Choose between 1 and 10 cards</p>
      </div>

      <button id="draw-button" class="btn btn-primary btn-lg btn-block">
        Draw Cards
      </button>
    </div>
  `

  const button = container.querySelector('#draw-button') as HTMLButtonElement
  const input = container.querySelector('#card-count') as HTMLInputElement

  // Disable button if input is invalid
  input.addEventListener('input', () => {
    const value = parseInt(input.value)
    button.disabled = !value || value < 1 || value > 10
  })

  button.addEventListener('click', handleDraw)
}

export function handleDraw(): void {
  const appElement = document.getElementById('app')
  if (!appElement) return

  const input = document.getElementById('card-count') as HTMLInputElement
  const count = parseInt(input.value) || 1

  currentDraw = drawCards(count)

  renderDrawResult(appElement, currentDraw)
}

export function renderDrawResult(container: HTMLElement, draw: DrawResult): void {
  const cardCount = draw.length
  const cardsHTML = draw
    .map((drawnCard, index) => {
      const orientation = drawnCard.reversed ? 'reversed' : 'upright'
      const revealDelay = `${index * 80}ms`
      const reversedClass = drawnCard.reversed ? ' is-reversed' : ''
      return `
        <div class="card-item" style="--card-delay: ${revealDelay};">
          <button class="card-flip" aria-label="Reveal card ${index + 1}: ${drawnCard.card.name} (${orientation})">
            <div class="card-flip-inner">
              <div class="card-face card-face--back" aria-hidden="true">
                <span class="card-back-symbol">✦</span>
              </div>
              <div class="card-face card-face--front${reversedClass}">
                <img class="card-art" src="${cardImageUrl(drawnCard.card)}" alt="" draggable="false" />
              </div>
            </div>
          </button>
        </div>
      `
    })
    .join('')

  container.innerHTML = `
    <div class="app-container">
      <header>
        <h1 class="title">Tarot Cards</h1>
        <p class="subtitle">Your reading</p>
      </header>

      <div class="results-header">
        <span class="results-count">${cardCount} card${cardCount !== 1 ? 's' : ''} drawn</span>
        <span id="spread-progress" class="spread-progress">Tap a card to reveal it</span>
      </div>

      <div id="cards" class="cards-container">
        ${cardsHTML}
      </div>

      <div class="divider"></div>

      <div class="btn-group">
        <button id="copy-button" class="btn btn-secondary" hidden>
          Copy to Clipboard
        </button>
        <button id="draw-again-button" class="btn btn-primary">
          Draw Again
        </button>
      </div>
    </div>
  `

  container.querySelectorAll('.card-flip').forEach((card) => {
    card.addEventListener('click', onCardClick)
  })

  const copyButton = container.querySelector('#copy-button') as HTMLButtonElement
  copyButton.addEventListener('click', handleCopy)

  const drawAgainButton = container.querySelector('#draw-again-button') as HTMLButtonElement
  drawAgainButton.addEventListener('click', handleDrawAgain)
}

export function onCardClick(event: Event): void {
  const card = event.currentTarget as HTMLButtonElement
  card.classList.toggle('is-flipped')

  const root = card.closest('.app-container')
  if (root) {
    updateSpreadState(root as HTMLElement)
  }
}

export function updateSpreadState(root: HTMLElement): void {
  const total = root.querySelectorAll('.card-flip').length
  const revealed = root.querySelectorAll('.card-flip.is-flipped').length

  const progress = root.querySelector('#spread-progress')
  if (progress) {
    progress.textContent =
      revealed === 0
        ? 'Tap a card to reveal it'
        : revealed < total
          ? `${revealed} of ${total} revealed`
          : 'All cards revealed'
  }

  const copyButton = root.querySelector('#copy-button')
  if (copyButton) {
    if (revealed === total && total > 0) {
      copyButton.removeAttribute('hidden')
    } else {
      copyButton.setAttribute('hidden', '')
    }
  }
}

export function handleCopy(): void {
  if (!currentDraw) return

  const text = formatDrawForCopy(currentDraw)
  navigator.clipboard.writeText(text)

  // Show confirmation message
  const copyButton = document.getElementById('copy-button') as HTMLButtonElement
  if (copyButton) {
    const originalText = copyButton.textContent
    const originalClass = copyButton.className

    copyButton.textContent = 'Copied!'
    copyButton.className = 'btn btn-success'
    copyButton.disabled = true

    setTimeout(() => {
      copyButton.textContent = originalText
      copyButton.className = originalClass
      copyButton.disabled = false
    }, 2000)
  }
}

export function handleDrawAgain(): void {
  const appElement = document.getElementById('app')
  if (!appElement) return

  currentDraw = null
  renderDrawButton(appElement)
}

export function formatDrawForCopy(draw: DrawResult): string {
  return draw
    .map((drawnCard, index) => {
      const orientation = drawnCard.reversed ? 'reversed' : 'upright'
      return `${index + 1}. ${drawnCard.card.name} (${orientation})`
    })
    .join('\n')
}

export function init(): void {
  const appElement = document.getElementById('app')
  if (!appElement) {
    return
  }

  renderDrawButton(appElement)
}
