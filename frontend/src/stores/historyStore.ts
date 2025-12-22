import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Food, HistoryItem } from '@/types'
import { storage } from '@/utils/storage'

const STORAGE_KEY = 'food-roulette-history'

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryItem[]>([])
  let nextId = 1

  const loadFromStorage = () => {
    const stored = storage.get<HistoryItem[]>(STORAGE_KEY, [])
    history.value = stored.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
    }))
    if (history.value.length > 0) {
      nextId = Math.max(...history.value.map(h => h.id)) + 1
    }
  }

  const saveToStorage = () => {
    storage.set(STORAGE_KEY, history.value)
  }

  const addHistory = (food: Food) => {
    const item: HistoryItem = {
      id: nextId++,
      food,
      createdAt: new Date(),
    }
    history.value.unshift(item)
    // 최근 50개만 유지
    if (history.value.length > 50) {
      history.value = history.value.slice(0, 50)
    }
    saveToStorage()
    return item
  }

  const clearHistory = () => {
    history.value = []
    saveToStorage()
  }

  const deleteHistory = (id: number) => {
    const index = history.value.findIndex(h => h.id === id)
    if (index !== -1) {
      history.value.splice(index, 1)
      saveToStorage()
    }
  }

  // 초기 로드
  loadFromStorage()

  return {
    history,
    addHistory,
    clearHistory,
    deleteHistory,
    loadFromStorage,
  }
})
