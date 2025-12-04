<script setup lang="ts">
import type { Food, Category } from '@/types'

interface Props {
  menu: Food
  category?: Category
}

defineProps<Props>()

const emit = defineEmits<{
  edit: [menu: Food]
  delete: [id: number]
}>()
</script>

<template>
  <div class="neon-card neon-card-cyan group">
    <div class="flex items-center gap-4">
      <!-- 이모지 -->
      <div class="text-4xl flex-shrink-0">
        {{ menu.emoji }}
      </div>

      <!-- 정보 -->
      <div class="flex-1 min-w-0">
        <h3 class="font-korean text-lg text-white truncate">
          {{ menu.name }}
        </h3>
        <p v-if="category" class="text-sm text-neon-cyan/70 font-pixel">
          {{ category.emoji }} {{ category.name }}
        </p>
      </div>

      <!-- 액션 버튼 -->
      <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          @click="emit('edit', menu)"
          class="p-2 text-neon-yellow hover:bg-neon-yellow/20 rounded transition-colors"
          title="수정"
        >
          ✏️
        </button>
        <button
          @click="emit('delete', menu.id)"
          class="p-2 text-neon-pink hover:bg-neon-pink/20 rounded transition-colors"
          title="삭제"
        >
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>
