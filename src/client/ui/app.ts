import type { DrawResult } from '../../shared/types.js'
import { drawCards } from '../../shared/draw.js'

let currentDraw: DrawResult | null = null

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
      const orientationClass = `card-orientation--${orientation}`
      return `
        <div class="card-item">
          <div class="card-content">
            <div class="card-info">
              <span class="card-number">Card ${index + 1}</span>
              <strong class="card-name">${drawnCard.card.name}</strong>
            </div>
            <span class="card-orientation ${orientationClass}">${orientation}</span>
          </div>
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
      </div>

      <div id="cards" class="cards-container">
        ${cardsHTML}
      </div>

      <div class="divider"></div>

      <div class="btn-group">
        <button id="copy-button" class="btn btn-secondary">
          Copy to Clipboard
        </button>
        <button id="draw-again-button" class="btn btn-primary">
          Draw Again
        </button>
      </div>
    </div>
  `

  const copyButton = container.querySelector('#copy-button') as HTMLButtonElement
  copyButton.addEventListener('click', handleCopy)

  const drawAgainButton = container.querySelector('#draw-again-button') as HTMLButtonElement
  drawAgainButton.addEventListener('click', handleDrawAgain)
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
