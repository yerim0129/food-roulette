import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Food, Category } from '@/types'

export const useRouletteStore = defineStore('roulette', () => {
  // State
  const foods = ref<Food[]>([])
  const categories = ref<Category[]>([
    { id: 1, name: '한식', emoji: '🍚', active: true },
    { id: 2, name: '중식', emoji: '🥟', active: true },
    { id: 3, name: '양식', emoji: '🍝', active: true },
    { id: 4, name: '일식', emoji: '🍣', active: true },
    { id: 5, name: '분식', emoji: '🍢', active: true },
  ])
  const selectedFood = ref<Food | null>(null)
  const isSpinning = ref(false)
  const history = ref<Food[]>([])

  // Getters
  const activeCategories = computed(() =>
    categories.value.filter(cat => cat.active)
  )

  const filteredFoods = computed(() =>
    foods.value.filter(food =>
      activeCategories.value.some(cat => cat.id === food.categoryId)
    )
  )

  // Actions
  const toggleCategory = (categoryId: number) => {
    const category = categories.value.find(cat => cat.id === categoryId)
    if (category) {
      category.active = !category.active
    }
  }

  const spin = async () => {
    if (filteredFoods.value.length === 0 || isSpinning.value) return

    isSpinning.value = true

    // 스핀 애니메이션 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 랜덤 선택
    const randomIndex = Math.floor(Math.random() * filteredFoods.value.length)
    selectedFood.value = filteredFoods.value[randomIndex] ?? null

    if (selectedFood.value) {
      history.value.unshift(selectedFood.value)
    }

    isSpinning.value = false
  }

  const reset = () => {
    selectedFood.value = null
  }

  const setFoods = (newFoods: Food[]) => {
    foods.value = newFoods
  }

  return {
    foods,
    categories,
    selectedFood,
    isSpinning,
    history,
    activeCategories,
    filteredFoods,
    toggleCategory,
    spin,
    reset,
    setFoods,
  }
})
