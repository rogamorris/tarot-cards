import type { DrawResult } from '../../shared/types.js'
import { drawCards } from '../../shared/draw.js'

let currentDraw: DrawResult | null = null

export function renderDrawButton(container: HTMLElement): void {
  container.innerHTML = `
    <div>
      <h1>Tarot Cards</h1>
      <label for="card-count">Number of cards:</label>
      <input
        type="number"
        id="card-count"
        min="1"
        max="10"
        value="1"
      />
      <button id="draw-button">Draw Cards</button>
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
  const cardsHTML = draw
    .map((drawnCard) => {
      const orientation = drawnCard.reversed ? 'reversed' : 'upright'
      return `<p><strong>${drawnCard.card.name}</strong> (${orientation})</p>`
    })
    .join('')

  container.innerHTML = `
    <div>
      <h1>Tarot Cards</h1>
      <div id="cards">
        ${cardsHTML}
      </div>
      <button id="copy-button">Copy to Clipboard</button>
      <button id="draw-again-button">Draw Again</button>
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
    copyButton.textContent = 'Copied to clipboard!'
    copyButton.disabled = true

    setTimeout(() => {
      copyButton.textContent = originalText
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
