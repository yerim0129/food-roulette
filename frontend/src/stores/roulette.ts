import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Food } from '@/types'
import { useMenuStore } from './menuStore'

export const useRouletteStore = defineStore('roulette', () => {
  // menuStore에서 categories 참조 (중복 제거)
  const menuStore = useMenuStore()

  // State
  const foods = ref<Food[]>([])
  const selectedFood = ref<Food | null>(null)
  const isSpinning = ref(false)

  // categories는 menuStore에서 가져옴
  const categories = computed(() => menuStore.categories)

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
    menuStore.toggleCategory(categoryId)
  }

  const spin = async () => {
    if (filteredFoods.value.length === 0 || isSpinning.value) return

    isSpinning.value = true

    // 스핀 애니메이션 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 랜덤 선택
    const randomIndex = Math.floor(Math.random() * filteredFoods.value.length)
    selectedFood.value = filteredFoods.value[randomIndex] ?? null

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
    activeCategories,
    filteredFoods,
    toggleCategory,
    spin,
    reset,
    setFoods,
  }
})

