<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)
const hasError = ref(false)

const resetError = () => {
  error.value = null
  hasError.value = false
}

onErrorCaptured((err: Error) => {
  error.value = err
  hasError.value = true
  console.error('ErrorBoundary caught:', err)
  return false
})
</script>

<template>
  <div v-if="hasError" class="error-boundary">
    <div class="retro-box text-center p-8">
      <div class="text-5xl mb-4">💥</div>
      <h2 class="font-pixel text-retro-pink text-lg mb-4">ERROR!</h2>
      <p class="font-arcade text-retro-cream text-sm mb-4">
        {{ error?.message || '알 수 없는 오류가 발생했습니다.' }}
      </p>
      <button @click="resetError" class="btn-neon-cyan">
        다시 시도
      </button>
    </div>
  </div>
  <slot v-else />
</template>

<style scoped>
.error-boundary {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
</style>
