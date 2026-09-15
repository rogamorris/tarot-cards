// Downloads the public-domain Rider–Waite–Smith tarot deck (first published
// 1909, illustrated by Pamela Colman Smith) from Wikimedia Commons into
// src/client/public/cards/, named by the app's card ids (e.g. the-fool.jpg).
//
// Usage: node scripts/download-cards.mjs   (or: pnpm cards)
//
// Wikimedia asks for a descriptive User-Agent and gentle request rates, so we
// throttle and retry on 429. Images are fetched at 440px wide to keep the
// repo light while staying crisp on retina phone screens.

import { mkdir, writeFile, access } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'src', 'client', 'public', 'cards')
const WIDTH = 440
const UA = 'tarot-cards/1.0 (https://github.com/rogamorris/tarot-cards)'

// Major Arcana, in the app's deck order (RWS_Tarot_00..21 on Commons)
const MAJOR = [
  ['RWS_Tarot_00_Fool.jpg', 'the-fool'],
  ['RWS_Tarot_01_Magician.jpg', 'the-magician'],
  ['RWS_Tarot_02_High_Priestess.jpg', 'the-high-priestess'],
  ['RWS_Tarot_03_Empress.jpg', 'the-empress'],
  ['RWS_Tarot_04_Emperor.jpg', 'the-emperor'],
  ['RWS_Tarot_05_Hierophant.jpg', 'the-hierophant'],
  ['RWS_Tarot_06_Lovers.jpg', 'the-lovers'],
  ['RWS_Tarot_07_Chariot.jpg', 'the-chariot'],
  ['RWS_Tarot_08_Strength.jpg', 'strength'],
  ['RWS_Tarot_09_Hermit.jpg', 'the-hermit'],
  ['RWS_Tarot_10_Wheel_of_Fortune.jpg', 'wheel-of-fortune'],
  ['RWS_Tarot_11_Justice.jpg', 'justice'],
  ['RWS_Tarot_12_Hanged_Man.jpg', 'the-hanged-man'],
  ['RWS_Tarot_13_Death.jpg', 'death'],
  ['RWS_Tarot_14_Temperance.jpg', 'temperance'],
  ['RWS_Tarot_15_Devil.jpg', 'the-devil'],
  ['RWS_Tarot_16_Tower.jpg', 'the-tower'],
  ['RWS_Tarot_17_Star.jpg', 'the-star'],
  ['RWS_Tarot_18_Moon.jpg', 'the-moon'],
  ['RWS_Tarot_19_Sun.jpg', 'the-sun'],
  ['RWS_Tarot_20_Judgement.jpg', 'judgement'],
  ['RWS_Tarot_21_World.jpg', 'the-world'],
]

// Minor arcana on Commons: <Prefix>NN.jpg, NN = 01..14
// (Ace..10, Page, Knight, Queen, King)
const SUITS = [
  ['Wands', 'wands'],
  ['Cups', 'cups'],
  ['Swords', 'swords'],
  ['Pents', 'pentacles'],
]
const RANKS = [
  'ace', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'page', 'knight', 'queen', 'king',
]

function manifest() {
  const items = MAJOR.map(([commons, local]) => ({ commons, local: `${local}.jpg` }))
  for (const [prefix, suit] of SUITS) {
    for (let n = 1; n <= 14; n++) {
      const nn = String(n).padStart(2, '0')
      items.push({ commons: `${prefix}${nn}.jpg`, local: `${RANKS[n - 1]}-of-${suit}.jpg` })
    }
  }
  return items
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function fetchImage(commonsFile, attempt = 1) {
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(commonsFile)}?width=${WIDTH}`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (res.status === 429 && attempt <= 5) {
    const wait = 2000 * attempt
    process.stdout.write(` (rate-limited, retry in ${wait}ms)`)
    await sleep(wait)
    return fetchImage(commonsFile, attempt + 1)
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${commonsFile}`)
  const ct = res.headers.get('content-type') || ''
  if (!ct.startsWith('image/')) throw new Error(`Non-image (${ct}) for ${commonsFile}`)
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const items = manifest()
  const pending = items.filter((item) => !existsSync(join(OUT, item.local)))
  let done = items.length - pending.length

  // Small worker pool: Commons generates each thumbnail on first hit, so a
  // few parallel requests keep things moving without hammering the server.
  const CONCURRENCY = 4
  const queue = [...pending]
  async function worker() {
    while (queue.length > 0) {
      const { commons, local } = queue.shift()
      const dest = join(OUT, local)
      if (await exists(dest)) {
        done++
        continue
      }
      process.stdout.write(`\r[${done + 1}/${items.length}] ${local} ← ${commons}`.padEnd(60))
      const buf = await fetchImage(commons)
      await writeFile(dest, buf)
      done++
      await sleep(350) // be polite to Wikimedia
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  process.stdout.write(`\rDownloaded ${done}/${items.length} cards into src/client/public/cards/`.padEnd(60))
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('\nDownload failed:', err.message)
  process.exit(1)
})
