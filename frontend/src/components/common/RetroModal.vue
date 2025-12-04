<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  modelValue: boolean
  borderColor?: 'pink' | 'cyan' | 'yellow'
  title?: string
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  borderColor: 'cyan',
  title: '',
  closable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const close = () => {
  if (props.closable) {
    emit('update:modelValue', false)
  }
}

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    close()
  }
}

// ESC 키로 닫기
watch(() => props.modelValue, (isOpen) => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.closable) {
      close()
    }
  }

  if (isOpen) {
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleEsc)
    document.body.style.overflow = ''
  }
})

const borderClasses = {
  pink: 'border-neon-pink shadow-neon-pink',
  cyan: 'border-neon-cyan shadow-neon-cyan',
  yellow: 'border-neon-yellow shadow-neon-yellow',
}

const titleClasses = {
  pink: 'text-neon-pink',
  cyan: 'text-neon-cyan',
  yellow: 'text-neon-yellow',
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="handleBackdropClick"
      >
        <!-- 배경 오버레이 -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        <!-- 모달 컨텐츠 -->
        <div
          :class="[
            'relative bg-retro-bg border-3 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto',
            borderClasses[borderColor],
          ]"
        >
          <!-- 헤더 -->
          <div v-if="title || closable" class="flex items-center justify-between mb-4">
            <h2
              v-if="title"
              :class="['font-pixel text-lg', titleClasses[borderColor]]"
            >
              {{ title }}
            </h2>
            <button
              v-if="closable"
              class="text-white/60 hover:text-white transition-colors text-2xl leading-none ml-auto"
              @click="close"
            >
              &times;
            </button>
          </div>

          <!-- 컨텐츠 -->
          <div class="text-white">
            <slot />
          </div>

          <!-- 푸터 슬롯 -->
          <div v-if="$slots.footer" class="mt-6 pt-4 border-t border-white/20">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.9);
}
</style>
