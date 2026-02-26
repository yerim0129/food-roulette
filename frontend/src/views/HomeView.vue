<script setup lang="ts">
import { ref } from 'vue'
import { useHistoryStore } from '@/stores/historyStore'
import type { Food } from '@/types'
import RouletteWheel from '@/components/roulette/RouletteWheel.vue'
import RetroButton from '@/components/common/RetroButton.vue'
import RetroModal from '@/components/common/RetroModal.vue'
import NearbyRestaurants from '@/components/map/NearbyRestaurants.vue'
import { useCategory } from '@/composables/useCategory'

const historyStore = useHistoryStore()
const { categories, activeCategoryIds, filteredMenus, toggleCategory, selectAllCategories, getCategoryById } = useCategory()

// 스핀 상태
const isSpinning = ref(false)

// 결과 모달
const showResult = ref(false)
const resultFood = ref<Food | null>(null)

// AI 추천 멘트
const aiMessage = ref('')
const isLoadingAI = ref(false)

// 스핀 시작
const startSpin = () => {
  if (isSpinning.value || filteredMenus.value.length === 0) return
  isSpinning.value = true
}

// AI 추천 멘트 가져오기
const fetchAIRecommendation = async (food: Food) => {
  isLoadingAI.value = true
  aiMessage.value = ''

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)

  try {
    const category = getCategoryById(food.categoryId)
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        foodName: food.name,
        category: category?.name,
      }),
      signal: controller.signal,
    })

    if (response.ok) {
      const data = await response.json()
      aiMessage.value = data.message
    } else {
      aiMessage.value = `오늘의 선택 ${food.name}! 맛있게 드세요 😋`
    }
  } catch {
    aiMessage.value = `오늘의 선택 ${food.name}! 맛있게 드세요 😋`
  } finally {
    clearTimeout(timeout)
    isLoadingAI.value = false
  }
}

// 스핀 종료 처리
const handleSpinEnd = (menu: Food) => {
  isSpinning.value = false
  resultFood.value = menu
  showResult.value = true

  // 히스토리에 저장
  historyStore.addHistory(menu)

  // AI 추천 멘트 가져오기
  fetchAIRecommendation(menu)
}

// 다시 돌리기
const spinAgain = () => {
  showResult.value = false
  resultFood.value = null
  showNearby.value = false
  aiMessage.value = ''
}

// 근처 맛집 표시 상태
const showNearby = ref(false)

// 근처 맛집 검색 토글
const toggleNearby = () => {
  showNearby.value = !showNearby.value
}

</script>

<template>
  <div class="min-h-screen flex flex-col items-center p-4 pt-6">
    <!-- 헤더 타이틀 -->
    <div class="text-center mb-6">
      <h1 class="font-pixel text-2xl md:text-3xl text-neon-yellow animate-glow">
        ★ FOOD ROULETTE ★
      </h1>
      <p class="font-korean text-lg text-neon-cyan mt-2 animate-pulse-neon">
        뭐 먹지?
      </p>
    </div>

    <!-- 룰렛 휠 -->
    <div class="relative mb-6">
      <RouletteWheel
        :menus="filteredMenus"
        :is-spinning="isSpinning"
        @spin-end="handleSpinEnd"
      />

      <!-- 메뉴 없음 오버레이 -->
      <div
        v-if="filteredMenus.length === 0"
        class="absolute inset-0 flex items-center justify-center bg-retro-bg/80"
      >
        <div class="text-center">
          <p class="text-4xl mb-2">🍽️</p>
          <p class="font-korean text-white/70">메뉴가 없습니다</p>
        </div>
      </div>
    </div>

    <!-- 카테고리 필터 -->
    <div class="w-full max-w-md mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="font-pixel text-xs text-neon-cyan">CATEGORY</span>
        <button
          @click="selectAllCategories"
          class="font-pixel text-xs text-white/50 hover:text-neon-pink transition-colors"
        >
          ALL
        </button>
      </div>
      <div class="flex flex-wrap gap-2 justify-center">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="toggleCategory(cat.id)"
          :class="[
            'px-3 py-2 font-korean text-sm border-2 transition-all',
            activeCategoryIds.has(cat.id)
              ? 'border-neon-pink bg-neon-pink/20 text-neon-pink shadow-neon-pink'
              : 'border-white/30 text-white/50 hover:border-white/50',
          ]"
        >
          {{ cat.emoji }} {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- 메뉴 카운트 -->
    <p class="font-pixel text-xs text-white/50 mb-4">
      {{ filteredMenus.length }} MENUS LOADED
    </p>

    <!-- 시작 버튼 -->
    <RetroButton
      variant="pink"
      size="lg"
      :disabled="isSpinning || filteredMenus.length === 0"
      class="w-full max-w-md text-xl"
      @click="startSpin"
    >
      <span v-if="isSpinning" class="animate-pulse">SPINNING...</span>
      <span v-else>▼ START ▼</span>
    </RetroButton>

    <!-- 하단 데코 이모지 -->
    <div class="mt-8 flex gap-3 text-2xl">
      <span class="animate-bounce" style="animation-delay: 0s;">🍕</span>
      <span class="animate-bounce" style="animation-delay: 0.1s;">🍜</span>
      <span class="animate-bounce" style="animation-delay: 0.2s;">🍣</span>
      <span class="animate-bounce" style="animation-delay: 0.3s;">🍔</span>
      <span class="animate-bounce" style="animation-delay: 0.4s;">🍱</span>
    </div>

    <!-- 결과 모달 -->
    <RetroModal
      v-model="showResult"
      title="TODAY'S PICK!"
      border-color="yellow"
    >
      <div v-if="resultFood" class="text-center py-4">
        <!-- 결과 이모지 -->
        <div class="text-6xl mb-4 animate-bounce">
          {{ resultFood.emoji }}
        </div>

        <!-- 결과 이름 -->
        <h2 class="font-korean text-2xl text-neon-yellow mb-2">
          {{ resultFood.name }}
        </h2>

        <!-- 카테고리 -->
        <p class="font-pixel text-xs text-neon-cyan">
          {{ getCategoryById(resultFood.categoryId)?.emoji }}
          {{ getCategoryById(resultFood.categoryId)?.name }}
        </p>

        <!-- AI 추천 멘트 -->
        <div class="mt-6 p-4 border-2 border-neon-green/50 bg-neon-green/10 min-h-[60px]">
          <div v-if="isLoadingAI" class="flex items-center justify-center gap-2">
            <span class="animate-pulse">🤖</span>
            <span class="font-korean text-neon-green/70 text-sm">AI가 멘트를 생성중...</span>
          </div>
          <p v-else class="font-korean text-neon-green">
            {{ aiMessage || '🎉 오늘의 메뉴가 정해졌습니다! 🎉' }}
          </p>
        </div>

        <!-- 근처 맛집 찾기 버튼 -->
        <div class="mt-4">
          <RetroButton
            variant="cyan"
            size="sm"
            class="w-full"
            @click="toggleNearby"
          >
            📍 {{ showNearby ? '맛집 목록 닫기' : '근처 맛집 찾기' }}
          </RetroButton>
        </div>

        <!-- 근처 맛집 목록 -->
        <div v-if="showNearby" class="mt-4">
          <NearbyRestaurants
            :keyword="resultFood.name"
            :auto-search="true"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3 justify-center">
          <RetroButton
            variant="cyan"
            size="sm"
            @click="showResult = false"
          >
            CLOSE
          </RetroButton>
          <RetroButton
            variant="pink"
            size="sm"
            @click="spinAgain"
          >
            AGAIN
          </RetroButton>
        </div>
      </template>
    </RetroModal>
  </div>
</template>

<style scoped>
@keyframes glow {
  0%, 100% {
    text-shadow: 0 0 10px var(--color-neon-yellow), 0 0 20px var(--color-neon-yellow);
  }
  50% {
    text-shadow: 0 0 20px var(--color-neon-yellow), 0 0 40px var(--color-neon-yellow);
  }
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}
</style>


