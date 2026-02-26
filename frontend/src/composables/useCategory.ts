import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMenuStore } from '@/stores/menuStore'

export const useCategory = () => {
  const menuStore = useMenuStore()
  const { menus, categories } = storeToRefs(menuStore)

  // 카테고리 활성 상태
  const activeCategoryIds = ref<Set<number>>(new Set(categories.value.map(c => c.id)))

  // 필터된 메뉴
  const filteredMenus = computed(() => {
    if (activeCategoryIds.value.size === 0) {
      return menus.value
    }
    return menus.value.filter(m => activeCategoryIds.value.has(m.categoryId))
  })

  // 카테고리 토글 (최소 1개 활성화 유지)
  const toggleCategory = (categoryId: number) => {
    const newSet = new Set(activeCategoryIds.value)
    if (newSet.has(categoryId)) {
      if (newSet.size > 1) {
        newSet.delete(categoryId)
      }
    } else {
      newSet.add(categoryId)
    }
    activeCategoryIds.value = newSet
  }

  // 전체 선택
  const selectAllCategories = () => {
    activeCategoryIds.value = new Set(categories.value.map(c => c.id))
  }

  // 카테고리 아이디로 카테고리 찾기
  const getCategoryById = (categoryId: number) => {
    return categories.value.find(c => c.id === categoryId)
  }

  return {
    categories,
    activeCategoryIds,
    filteredMenus,
    toggleCategory,
    selectAllCategories,
    getCategoryById,
  }
}
