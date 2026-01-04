export type Suit = 'Major Arcana' | 'Wands' | 'Cups' | 'Swords' | 'Pentacles'

export interface Card {
  id: string
  name: string
  suit: Suit
}

export interface DrawnCard {
  card: Card
  reversed: boolean
}

export type DrawResult = DrawnCard[]
