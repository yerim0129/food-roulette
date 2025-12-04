import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Food, Category } from '@/types'

const STORAGE_KEY = 'food-roulette-menus'

// 기본 메뉴 데이터
const defaultMenus: Food[] = [
  { id: 1, name: '김치찌개', emoji: '🍲', categoryId: 1 },
  { id: 2, name: '비빔밥', emoji: '🍚', categoryId: 1 },
  { id: 3, name: '불고기', emoji: '🥩', categoryId: 1 },
  { id: 4, name: '삼겹살', emoji: '🥓', categoryId: 1 },
  { id: 5, name: '짜장면', emoji: '🍝', categoryId: 2 },
  { id: 6, name: '짬뽕', emoji: '🍜', categoryId: 2 },
  { id: 7, name: '탕수육', emoji: '🍖', categoryId: 2 },
  { id: 8, name: '파스타', emoji: '🍝', categoryId: 3 },
  { id: 9, name: '피자', emoji: '🍕', categoryId: 3 },
  { id: 10, name: '스테이크', emoji: '🥩', categoryId: 3 },
  { id: 11, name: '초밥', emoji: '🍣', categoryId: 4 },
  { id: 12, name: '라멘', emoji: '🍜', categoryId: 4 },
  { id: 13, name: '돈카츠', emoji: '🍱', categoryId: 4 },
  { id: 14, name: '떡볶이', emoji: '🍢', categoryId: 5 },
  { id: 15, name: '순대', emoji: '🌭', categoryId: 5 },
  { id: 16, name: '튀김', emoji: '🍤', categoryId: 5 },
]

export const useMenuStore = defineStore('menu', () => {
  // State
  const menus = ref<Food[]>([])
  const categories = ref<Category[]>([
    { id: 1, name: '한식', emoji: '🍚', active: true },
    { id: 2, name: '중식', emoji: '🥟', active: true },
    { id: 3, name: '양식', emoji: '🍝', active: true },
    { id: 4, name: '일식', emoji: '🍣', active: true },
    { id: 5, name: '분식', emoji: '🍢', active: true },
  ])

  // Getters
  const getMenusByCategory = computed(() => {
    return (categoryId: number) => menus.value.filter(menu => menu.categoryId === categoryId)
  })

  const getCategoryById = computed(() => {
    return (categoryId: number) => categories.value.find(cat => cat.id === categoryId)
  })

  const nextId = computed(() => {
    if (menus.value.length === 0) return 1
    return Math.max(...menus.value.map(m => m.id)) + 1
  })

  // Actions
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        menus.value = JSON.parse(stored)
      } else {
        menus.value = [...defaultMenus]
        saveToStorage()
      }
    } catch {
      menus.value = [...defaultMenus]
    }
  }

  const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menus.value))
  }

  const addMenu = (menu: Omit<Food, 'id'>) => {
    const newMenu: Food = {
      ...menu,
      id: nextId.value,
    }
    menus.value.push(newMenu)
    saveToStorage()
    return newMenu
  }

  const updateMenu = (id: number, updates: Partial<Omit<Food, 'id'>>) => {
    const index = menus.value.findIndex(m => m.id === id)
    if (index !== -1) {
      const existing = menus.value[index]
      if (existing) {
        menus.value[index] = { ...existing, ...updates }
        saveToStorage()
        return true
      }
    }
    return false
  }

  const deleteMenu = (id: number) => {
    const index = menus.value.findIndex(m => m.id === id)
    if (index !== -1) {
      menus.value.splice(index, 1)
      saveToStorage()
      return true
    }
    return false
  }

  const resetToDefault = () => {
    menus.value = [...defaultMenus]
    saveToStorage()
  }

  // 초기 로드
  loadFromStorage()

  return {
    menus,
    categories,
    getMenusByCategory,
    getCategoryById,
    nextId,
    loadFromStorage,
    addMenu,
    updateMenu,
    deleteMenu,
    resetToDefault,
  }
})
