export interface Category {
  id: number
  name: string
  emoji: string
}

export interface Food {
  id: number
  name: string
  emoji: string
  description?: string
  imageUrl?: string
  categoryId: number
}

export interface History {
  id: number
  foodId: number
  food?: Food
  createdAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
