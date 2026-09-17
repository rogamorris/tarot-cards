import type { Card, DrawResult } from '../../shared/types.js'
import { drawSelectedCards } from '../../shared/draw.js'
import { TAROT_DECK } from '../../shared/deck.js'

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

      <button id="draw-button" class="btn btn-primary btn-lg btn-block">
        Shuffle and Deal
      </button>
    </div>
  `

  const button = container.querySelector('#draw-button') as HTMLButtonElement
  button.addEventListener('click', handleDraw)
}

export function handleDraw(): void {
  const appElement = document.getElementById('app')
  if (!appElement) return

  startSelection(appElement)
}

/** The most cards a single reading can hold — the spread layout is built for up to ten. */
export const MAX_SELECTION = 10

/**
 * Pure selection toggle for the fan view: adds the id when under the limit,
 * removes it when already selected, and refuses to exceed the limit.
 */
export function toggleSelection(selected: string[], id: string, max: number): string[] {  if (selected.includes(id)) {
    return selected.filter((s) => s !== id)
  }
  if (selected.length >= max) {
    return selected
  }
  return [...selected, id]
}

/** Begins the card-choosing ritual: shuffle animation, then the fan. */
export function startSelection(container: HTMLElement): void {
  renderShuffleView(container)
  window.setTimeout(() => {
    renderFanView(container)
  }, 1700)
}

export function renderShuffleView(container: HTMLElement): void {
  container.innerHTML = `
    <div class="app-container">
      <header>
        <h1 class="title">Tarot Cards</h1>
        <p class="subtitle">Shuffling the deck…</p>
      </header>

      <div class="shuffle-stage" aria-hidden="true">
        <div class="shuffle-deck">
          <div class="deck-layer deck-layer--1"></div>
          <div class="deck-layer deck-layer--2"></div>
          <div class="deck-layer deck-layer--3"></div>
        </div>
      </div>

      <p class="fan-hint">Get ready to choose your cards</p>
    </div>
  `
}

export function renderFanView(container: HTMLElement): void {
  // Deal order runs left-to-right across the ring: rank cards by their
  // horizontal position (x = R·sin θ) so the visible sweep starts at
  // the left edge instead of jumping around the circle.
  const dealRank = new Map<number, number>()
  TAROT_DECK.map((_, index) => index)
    .sort(
      (a, b) =>
        Math.sin((a / TAROT_DECK.length) * Math.PI * 2) -
        Math.sin((b / TAROT_DECK.length) * Math.PI * 2),
    )
    .forEach((cardIndex, rank) => dealRank.set(cardIndex, rank))

  const cardsHTML = TAROT_DECK.map((card, index) => {
    const angle = (index / TAROT_DECK.length) * 360
    return `
      <div class="fan-card-pos" style="--angle: ${angle}deg; --i: ${dealRank.get(index)};">
        <div class="fan-card-upright">
          <button class="fan-card" data-card-id="${card.id}" aria-pressed="false" aria-label="Choose a card">
            <span class="card-back-symbol">✦</span>
          </button>
        </div>
      </div>
    `
  }).join('')

  container.innerHTML = `
    <div class="app-container fan-app">
      <header>
        <h1 class="title">Tarot Cards</h1>
        <p class="subtitle">Choose your cards</p>
        <span id="fan-count" class="fan-count">0 chosen</span>
      </header>

      <div class="fan-stage">
        <div class="fan-spinner" aria-hidden="false">
          ${cardsHTML}
        </div>
        <div class="fan-tray" aria-label="Chosen cards"></div>
      </div>

      <p class="fan-hint">Tap the cards you want — tap again to put one back</p>

      <div class="btn-group">
        <button id="fan-cancel-button" class="btn btn-secondary">
          Start Over
        </button>
        <button id="reveal-button" class="btn btn-primary" hidden>
          Reveal My Cards
        </button>
      </div>
    </div>
  `

  container.querySelectorAll('.fan-card').forEach((card) => {
    card.addEventListener('click', onFanCardClick)
  })

  const revealButton = container.querySelector('#reveal-button') as HTMLButtonElement
  revealButton.addEventListener('click', handleRevealSelection)

  const cancelButton = container.querySelector('#fan-cancel-button') as HTMLButtonElement
  cancelButton.addEventListener('click', () => renderDrawButton(container))

  // Deal the cards out from the deck after the first paint, so each
  // card flies from the stack to its slot on the ring.
  const stage = container.querySelector('.fan-stage') as HTMLElement | null
  if (stage) {
    requestAnimationFrame(() => requestAnimationFrame(() => dealFanCards(stage)))
  }
}

/**
 * Starts the fan deal animation: cards fly from the deck position
 * out to their slots on the ring, then the ring begins to spin.
 */
export function dealFanCards(stage: HTMLElement): void {
  stage.classList.add('is-dealt')
}

function onFanCardClick(event: Event): void {
  const tapped = event.currentTarget as HTMLButtonElement
  toggleFanCard(nearestVisibleCard(tapped, event) ?? tapped)
}

/**
 * The ring cards overlap, so the topmost card at the tap point is not
 * always the one the user aimed at. Resolve the tap to the visible card
 * whose center is nearest the tap point instead, so every visible part
 * of a card selects that card.
 */
function nearestVisibleCard(tapped: HTMLButtonElement, event: Event): HTMLButtonElement | null {
  // Keyboard activation carries no coordinates — keep the focused card.
  if (!(event instanceof MouseEvent) || (event.clientX === 0 && event.clientY === 0)) return null

  const root = tapped.closest('.app-container')
  if (!root) return null

  let best: HTMLButtonElement | null = null
  let bestDist = Infinity
  root.querySelectorAll('.fan-spinner .fan-card').forEach((el) => {
    const card = el as HTMLButtonElement
    // Chosen cards are hidden in place; they must not win the tap.
    if (card.closest('.fan-card-pos')?.classList.contains('is-selected')) return
    const rect = card.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const dx = rect.left + rect.width / 2 - event.clientX
    const dy = rect.top + rect.height / 2 - event.clientY
    const dist = dx * dx + dy * dy
    if (dist < bestDist) {
      bestDist = dist
      best = card
    }
  })
  return best
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Toggles a ring card's selected state. A chosen card is pinned as a
 * clone in the tray at the top of the stage, where it stays put while
 * the rest of the ring keeps circling; the ring original is hidden in
 * place so its slot is preserved for the flight back.
 */
export function toggleFanCard(card: HTMLButtonElement): void {
  const root = card.closest('.app-container') as HTMLElement
  if (!root) return

  const currentlySelected = root.querySelectorAll('.fan-card-pos.is-selected .fan-card')
  const selectedIds = Array.from(currentlySelected).map(
    (el) => (el as HTMLButtonElement).dataset.cardId as string,
  )

  const next = toggleSelection(selectedIds, card.dataset.cardId as string, MAX_SELECTION)
  const isNowSelected = next.includes(card.dataset.cardId as string)

  card.closest('.fan-card-pos')?.classList.toggle('is-selected', isNowSelected)
  card.setAttribute('aria-pressed', String(isNowSelected))

  const tray = root.querySelector('.fan-tray') as HTMLElement | null
  if (tray) {
    if (isNowSelected) {
      flyCardToTray(card, tray)
    } else {
      dismissTrayClone(tray, card.dataset.cardId as string)
    }
  }

  updateFanState(root, next.length)
}

/**
 * Pins a clone of the chosen ring card to the tray, flying it from its
 * current spot on the ring up to the tray.
 */
export function flyCardToTray(card: HTMLButtonElement, tray: HTMLElement): void {
  const cardId = card.dataset.cardId as string
  const alreadyPinned = Array.from(tray.children).some(
    (el) => (el as HTMLElement).dataset.cardId === cardId,
  )
  if (alreadyPinned) return

  const from = card.getBoundingClientRect()

  const clone = card.cloneNode(true) as HTMLButtonElement
  clone.setAttribute('aria-pressed', 'true')
  clone.setAttribute('aria-label', 'Chosen card — tap to put it back')
  clone.addEventListener('click', () => toggleFanCard(card))
  tray.appendChild(clone)

  if (prefersReducedMotion() || typeof clone.animate !== 'function') return

  const to = clone.getBoundingClientRect()
  const dx = from.left - to.left
  const dy = from.top - to.top
  const scale = from.width / to.width || 1

  clone.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
      { transform: 'translate(0px, 0px) scale(1)' },
    ],
    {
      duration: 450,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'backwards',
    },
  )
}

/**
 * Removes a card's clone from the tray when it is put back on the ring.
 */
export function dismissTrayClone(tray: HTMLElement, cardId: string): void {
  const clone = Array.from(tray.children).find(
    (el) => (el as HTMLElement).dataset.cardId === cardId,
  ) as HTMLElement | undefined
  if (!clone) return

  if (prefersReducedMotion() || typeof clone.animate !== 'function') {
    clone.remove()
    return
  }

  const fade = clone.animate(
    [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(0.6)' },
    ],
    { duration: 200, easing: 'ease-out', fill: 'forwards' },
  )
  fade.onfinish = () => clone.remove()
}

export function updateFanState(root: HTMLElement, chosen: number): void {
  const counter = root.querySelector('#fan-count')
  if (counter) {
    counter.textContent = `${chosen} chosen`
  }

  const revealButton = root.querySelector('#reveal-button')
  if (revealButton) {
    if (chosen > 0) {
      revealButton.removeAttribute('hidden')
    } else {
      revealButton.setAttribute('hidden', '')
    }
  }
}

export function handleRevealSelection(): void {
  const appElement = document.getElementById('app')
  if (!appElement) return

  const selectedCards = Array.from(
    appElement.querySelectorAll('.fan-card-pos.is-selected .fan-card'),
  ) as HTMLButtonElement[]
  const ids = selectedCards.map((el) => el.dataset.cardId as string)
  // Capture the pinned tray positions before the spread replaces them,
  // so the chosen cards fly into their new slots from where the user
  // sees them (the hidden ring originals are still circling behind).
  const trayRects = new Map<string, DOMRect>()
  appElement.querySelectorAll('.fan-tray .fan-card').forEach((el) => {
    trayRects.set(
      (el as HTMLButtonElement).dataset.cardId as string,
      el.getBoundingClientRect(),
    )
  })
  const fromRects = ids
    .map((id) => trayRects.get(id))
    .filter((rect): rect is DOMRect => !!rect)

  currentDraw = drawSelectedCards(ids)
  renderDrawResult(appElement, currentDraw)

  const slots = Array.from(appElement.querySelectorAll('.card-item')) as HTMLElement[]
  flyCardsToSpread(slots, fromRects)
}

/**
 * Flies spread cards in from their pinned positions in the selection
 * tray, keeping the selection-to-reveal transition continuous.
 */
export function flyCardsToSpread(slots: HTMLElement[], fromRects: DOMRect[]): void {
  if (prefersReducedMotion()) return

  slots.forEach((slot, index) => {
    const from = fromRects[index]
    if (!from || typeof slot.animate !== 'function') return

    const to = slot.getBoundingClientRect()
    const dx = from.left + from.width / 2 - (to.left + to.width / 2)
    const dy = from.top + from.height / 2 - (to.top + to.height / 2)
    const scale = from.width / to.width || 1

    slot.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
        { transform: 'translate(0px, 0px) scale(1)' },
      ],
      {
        duration: 650,
        delay: index * 90,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'backwards',
      },
    )
  })
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
        <button id="reveal-all-button" class="btn btn-primary">
          Reveal All
        </button>
        <button id="draw-again-button" class="btn btn-secondary">
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

  const revealAllButton = container.querySelector('#reveal-all-button') as HTMLButtonElement
  revealAllButton.addEventListener('click', handleRevealAll)
}

export function handleRevealAll(event: Event): void {
  const button = event.currentTarget as HTMLButtonElement | null
  const root = button?.closest('.app-container')
  if (!root) return

  root.querySelectorAll('.card-flip').forEach((card) => {
    card.classList.add('is-flipped')
  })
  updateSpreadState(root as HTMLElement)
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

  // Once everything is face-up there is nothing left to reveal.
  const revealAllButton = root.querySelector('#reveal-all-button')
  if (revealAllButton) {
    if (revealed === total && total > 0) {
      revealAllButton.setAttribute('hidden', '')
    } else {
      revealAllButton.removeAttribute('hidden')
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
