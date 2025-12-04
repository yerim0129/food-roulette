<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Food, Category } from '@/types'
import RetroButton from '@/components/common/RetroButton.vue'
import RetroModal from '@/components/common/RetroModal.vue'

interface Props {
  modelValue: boolean
  editMenu?: Food | null
  categories: Category[]
}

const props = withDefaults(defineProps<Props>(), {
  editMenu: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [menu: Omit<Food, 'id'> & { id?: number }]
}>()

// 폼 데이터
const name = ref('')
const emoji = ref('🍽️')
const categoryId = ref(1)

// 이모지 선택 옵션
const emojiOptions = [
  '🍽️', '🍚', '🍜', '🍝', '🍲', '🍱', '🍣', '🍕',
  '🍔', '🌭', '🍟', '🥩', '🥓', '🍖', '🍗', '🥟',
  '🍢', '🍤', '🥗', '🥘', '🍳', '🥚', '🧀', '🥐',
  '🍰', '🎂', '🍩', '🍪', '☕', '🍵', '🧃', '🥤',
]

// 모달 제목
const modalTitle = computed(() => props.editMenu ? 'EDIT MENU' : 'NEW MENU')

// 편집 모드일 때 데이터 로드
watch(() => props.editMenu, (menu) => {
  if (menu) {
    name.value = menu.name
    emoji.value = menu.emoji
    categoryId.value = menu.categoryId
  } else {
    resetForm()
  }
}, { immediate: true })

const resetForm = () => {
  name.value = ''
  emoji.value = '🍽️'
  categoryId.value = 1
}

const handleSubmit = () => {
  if (!name.value.trim()) return

  const menuData = {
    name: name.value.trim(),
    emoji: emoji.value,
    categoryId: categoryId.value,
    ...(props.editMenu && { id: props.editMenu.id }),
  }

  emit('submit', menuData)
  emit('update:modelValue', false)
  resetForm()
}

const handleClose = () => {
  emit('update:modelValue', false)
  resetForm()
}
</script>

<template>
  <RetroModal
    :model-value="modelValue"
    :title="modalTitle"
    border-color="yellow"
    @update:model-value="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 이름 입력 -->
      <div>
        <label class="block font-pixel text-xs text-neon-cyan mb-2">
          MENU NAME
        </label>
        <input
          v-model="name"
          type="text"
          placeholder="메뉴 이름 입력..."
          class="w-full bg-retro-bg border-2 border-neon-cyan/50 px-4 py-3
                 font-korean text-white placeholder-white/30
                 focus:border-neon-cyan focus:outline-none focus:shadow-neon-cyan
                 transition-all"
          required
        />
      </div>

      <!-- 카테고리 선택 -->
      <div>
        <label class="block font-pixel text-xs text-neon-cyan mb-2">
          CATEGORY
        </label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            @click="categoryId = cat.id"
            :class="[
              'px-3 py-2 border-2 font-korean text-sm transition-all',
              categoryId === cat.id
                ? 'border-neon-pink bg-neon-pink/20 text-neon-pink'
                : 'border-white/30 text-white/70 hover:border-white/50',
            ]"
          >
            {{ cat.emoji }} {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- 이모지 선택 -->
      <div>
        <label class="block font-pixel text-xs text-neon-cyan mb-2">
          EMOJI
        </label>
        <div class="grid grid-cols-8 gap-1">
          <button
            v-for="e in emojiOptions"
            :key="e"
            type="button"
            @click="emoji = e"
            :class="[
              'text-2xl p-2 rounded transition-all',
              emoji === e
                ? 'bg-neon-yellow/30 scale-110'
                : 'hover:bg-white/10',
            ]"
          >
            {{ e }}
          </button>
        </div>
      </div>

      <!-- 미리보기 -->
      <div class="p-4 bg-retro-card border-2 border-neon-green/50">
        <p class="font-pixel text-xs text-neon-green mb-2">PREVIEW</p>
        <div class="flex items-center gap-3">
          <span class="text-3xl">{{ emoji }}</span>
          <span class="font-korean text-lg text-white">
            {{ name || '메뉴 이름' }}
          </span>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex gap-3">
        <RetroButton
          variant="cyan"
          size="sm"
          type="button"
          @click="handleClose"
        >
          CANCEL
        </RetroButton>
        <RetroButton
          variant="pink"
          size="sm"
          @click="handleSubmit"
          :disabled="!name.trim()"
        >
          {{ editMenu ? 'UPDATE' : 'ADD' }}
        </RetroButton>
      </div>
    </template>
  </RetroModal>
</template>
