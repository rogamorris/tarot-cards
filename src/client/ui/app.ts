import type { DrawResult } from '../../shared/types.js'
import { drawCards } from '../../shared/draw.js'

let currentDraw: DrawResult | null = null

export function renderDrawButton(container: HTMLElement): void {
  container.innerHTML = `
    <div>
      <h1>Tarot Cards</h1>
      <button id="draw-button">Draw a Card</button>
    </div>
  `

  const button = container.querySelector('#draw-button') as HTMLButtonElement
  button.addEventListener('click', handleDraw)
}

export function handleDraw(): void {
  const appElement = document.getElementById('app')
  if (!appElement) return

  // Draw 1 card (hardcoded for walking skeleton)
  currentDraw = drawCards(1)

  renderDrawResult(appElement, currentDraw)
}

export function renderDrawResult(container: HTMLElement, draw: DrawResult): void {
  const card = draw[0]
  const orientation = card.reversed ? 'reversed' : 'upright'

  container.innerHTML = `
    <div>
      <h1>Tarot Cards</h1>
      <div id="cards">
        <p><strong>${card.card.name}</strong> (${orientation})</p>
      </div>
      <button id="copy-button">Copy to Clipboard</button>
    </div>
  `

  const copyButton = container.querySelector('#copy-button') as HTMLButtonElement
  copyButton.addEventListener('click', handleCopy)
}

export function handleCopy(): void {
  if (!currentDraw) return

  const text = formatDrawForCopy(currentDraw)
  navigator.clipboard.writeText(text)
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
