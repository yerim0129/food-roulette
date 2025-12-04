<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMenuStore } from '@/stores/menuStore'
import type { Food } from '@/types'
import RetroButton from '@/components/common/RetroButton.vue'
import MenuCard from '@/components/menu/MenuCard.vue'
import MenuForm from '@/components/menu/MenuForm.vue'
import RetroModal from '@/components/common/RetroModal.vue'

const menuStore = useMenuStore()
const { menus, categories } = storeToRefs(menuStore)
const { addMenu, updateMenu, deleteMenu, getCategoryById } = menuStore

// 상태
const selectedCategoryId = ref<number | null>(null)
const showForm = ref(false)
const editingMenu = ref<Food | null>(null)
const showDeleteConfirm = ref(false)
const menuToDelete = ref<number | null>(null)

// 필터된 메뉴
const filteredMenus = computed(() => {
  if (selectedCategoryId.value === null) {
    return menus.value
  }
  return menus.value.filter(m => m.categoryId === selectedCategoryId.value)
})

// 카테고리 탭 클릭
const selectCategory = (categoryId: number | null) => {
  selectedCategoryId.value = categoryId
}

// 메뉴 추가/수정 폼 열기
const openAddForm = () => {
  editingMenu.value = null
  showForm.value = true
}

const openEditForm = (menu: Food) => {
  editingMenu.value = menu
  showForm.value = true
}

// 폼 제출 처리
const handleFormSubmit = (menuData: Omit<Food, 'id'> & { id?: number }) => {
  if (menuData.id) {
    updateMenu(menuData.id, menuData)
  } else {
    addMenu(menuData)
  }
}

// 삭제 확인
const confirmDelete = (id: number) => {
  menuToDelete.value = id
  showDeleteConfirm.value = true
}

const handleDelete = () => {
  if (menuToDelete.value) {
    deleteMenu(menuToDelete.value)
    menuToDelete.value = null
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <div class="min-h-screen p-4 pt-6">
    <div class="max-w-2xl mx-auto">
      <!-- 헤더 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="font-pixel text-xl text-neon-yellow">
          MENU LIST
        </h1>
        <RetroButton variant="pink" size="sm" @click="openAddForm">
          + ADD
        </RetroButton>
      </div>

      <!-- 카테고리 필터 탭 -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          @click="selectCategory(null)"
          :class="[
            'px-4 py-2 font-pixel text-xs border-2 transition-all',
            selectedCategoryId === null
              ? 'border-neon-pink bg-neon-pink/20 text-neon-pink shadow-neon-pink'
              : 'border-white/30 text-white/70 hover:border-neon-cyan',
          ]"
        >
          ALL
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="selectCategory(cat.id)"
          :class="[
            'px-4 py-2 font-pixel text-xs border-2 transition-all',
            selectedCategoryId === cat.id
              ? 'border-neon-pink bg-neon-pink/20 text-neon-pink shadow-neon-pink'
              : 'border-white/30 text-white/70 hover:border-neon-cyan',
          ]"
        >
          {{ cat.emoji }} {{ cat.name }}
        </button>
      </div>

      <!-- 메뉴 카운트 -->
      <p class="font-pixel text-xs text-neon-cyan mb-4">
        {{ filteredMenus.length }} MENUS
      </p>

      <!-- 메뉴 리스트 -->
      <div class="space-y-3">
        <MenuCard
          v-for="menu in filteredMenus"
          :key="menu.id"
          :menu="menu"
          :category="getCategoryById(menu.categoryId)"
          @edit="openEditForm"
          @delete="confirmDelete"
        />

        <!-- 빈 상태 -->
        <div
          v-if="filteredMenus.length === 0"
          class="text-center py-12"
        >
          <p class="text-4xl mb-4">🍽️</p>
          <p class="font-korean text-white/50">
            메뉴가 없습니다
          </p>
          <RetroButton
            variant="cyan"
            size="sm"
            class="mt-4"
            @click="openAddForm"
          >
            ADD FIRST MENU
          </RetroButton>
        </div>
      </div>
    </div>

    <!-- 메뉴 추가/수정 폼 -->
    <MenuForm
      v-model="showForm"
      :edit-menu="editingMenu"
      :categories="categories"
      @submit="handleFormSubmit"
    />

    <!-- 삭제 확인 모달 -->
    <RetroModal
      v-model="showDeleteConfirm"
      title="DELETE?"
      border-color="pink"
    >
      <p class="font-korean text-white text-center mb-4">
        정말 이 메뉴를 삭제하시겠습니까?
      </p>
      <template #footer>
        <div class="flex gap-3 justify-center">
          <RetroButton
            variant="cyan"
            size="sm"
            @click="showDeleteConfirm = false"
          >
            CANCEL
          </RetroButton>
          <RetroButton
            variant="pink"
            size="sm"
            @click="handleDelete"
          >
            DELETE
          </RetroButton>
        </div>
      </template>
    </RetroModal>
  </div>
</template>
