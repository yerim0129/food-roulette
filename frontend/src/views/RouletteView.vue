<script setup lang="ts">
import { useRouletteStore } from '@/stores/roulette'
import { useMenuStore } from '@/stores/menuStore'
import { useHistoryStore } from '@/stores/historyStore'
import { storeToRefs } from 'pinia'
import { onMounted, watch } from 'vue'

const store = useRouletteStore()
const menuStore = useMenuStore()
const historyStore = useHistoryStore()
const { selectedFood, isSpinning, categories, filteredFoods } = storeToRefs(store)
const { toggleCategory, spin, reset, setFoods } = store

// 룰렛 결과를 히스토리에 저장
watch(selectedFood, (food) => {
  if (food) {
    historyStore.addHistory(food)
  }
})

// menuStore에서 데이터 로드 (하드코딩 제거)
onMounted(() => {
  setFoods(menuStore.menus)
})

// menuStore 변경 시 동기화 (deep watch 대신 menus 길이 변화 감지)
watch(() => menuStore.menus.length, () => {
  setFoods(menuStore.menus)
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center p-4 pt-8">
    <!-- 타이틀 -->
    <h1 class="retro-title text-2xl md:text-4xl mb-8">
      ★ FOOD ROULETTE ★
    </h1>

    <!-- 룰렛 박스 -->
    <div class="retro-box w-full max-w-md mb-8">
      <!-- 슬롯 윈도우 -->
      <div class="slot-window h-32 flex items-center justify-center mb-6">
        <div v-if="isSpinning" class="text-center">
          <div class="text-5xl animate-bounce">🎰</div>
          <p class="font-pixel text-retro-yellow text-xs mt-2 animate-blink">
            SPINNING...
          </p>
        </div>
        <div v-else-if="selectedFood" class="text-center">
          <div class="text-5xl mb-2">{{ selectedFood.emoji }}</div>
          <p class="font-pixel text-retro-yellow text-sm">
            {{ selectedFood.name }}
          </p>
        </div>
        <div v-else class="text-center">
          <div class="text-4xl text-retro-cyan">?</div>
          <p class="font-arcade text-retro-cream text-sm mt-2">
            버튼을 눌러주세요
          </p>
        </div>
      </div>

      <!-- 컨트롤 버튼 -->
      <div class="flex gap-4">
        <button
          @click="spin"
          :disabled="isSpinning || filteredFoods.length === 0"
          class="btn-neon flex-1"
          :class="{ 'opacity-50 cursor-not-allowed': isSpinning || filteredFoods.length === 0 }"
        >
          {{ isSpinning ? '...' : '▼ SPIN ▼' }}
        </button>
        <button
          @click="reset"
          class="btn-neon-cyan"
        >
          RESET
        </button>
      </div>
    </div>

    <!-- 카테고리 필터 -->
    <div class="w-full max-w-md">
      <p class="font-pixel text-retro-cream text-xs mb-3">SELECT CATEGORY:</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="toggleCategory(category.id)"
          class="category-tag"
          :class="{ active: category.active }"
        >
          {{ category.emoji }} {{ category.name }}
        </button>
      </div>
    </div>

    <!-- 선택된 음식 수 표시 -->
    <p class="font-arcade text-retro-cyan text-sm mt-6">
      선택 가능: {{ filteredFoods.length }}개 메뉴
    </p>
  </div>
</template>
