export interface Food {
  id: number
  name: string
  emoji: string
  categoryId: number
  description?: string
  imageUrl?: string
}

export interface Category {
  id: number
  name: string
  emoji: string
  active: boolean
}

export interface SpinResult {
  food: Food
  timestamp: Date
}
