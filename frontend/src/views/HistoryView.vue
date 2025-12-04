<script setup lang="ts">
import { useRouletteStore } from '@/stores/roulette'
import { storeToRefs } from 'pinia'

const store = useRouletteStore()
const { history } = storeToRefs(store)
</script>

<template>
  <div class="min-h-screen flex flex-col items-center p-4 pt-8">
    <!-- 타이틀 -->
    <h1 class="retro-title text-2xl md:text-4xl mb-8">
      ★ HISTORY ★
    </h1>

    <!-- 히스토리 리스트 -->
    <div class="w-full max-w-md">
      <div v-if="history.length === 0" class="retro-box text-center">
        <p class="font-arcade text-retro-cream">
          아직 기록이 없습니다
        </p>
        <p class="font-arcade text-retro-cyan text-sm mt-2">
          룰렛을 돌려보세요!
        </p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(food, index) in history"
          :key="index"
          class="food-card flex items-center gap-4"
        >
          <div class="text-3xl">{{ food.emoji }}</div>
          <div>
            <p class="font-pixel text-retro-yellow text-sm">
              {{ food.name }}
            </p>
            <p class="font-arcade text-retro-cream text-xs">
              #{{ history.length - index }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
