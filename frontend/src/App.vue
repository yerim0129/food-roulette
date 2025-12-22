<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
</script>

<template>
  <div class="min-h-screen crt-effect">
    <!-- 네비게이션 -->
    <nav class="fixed bottom-0 left-0 right-0 bg-retro-bg border-t-2 border-neon-pink z-50">
      <div class="flex justify-around py-3">
        <RouterLink
          to="/"
          class="flex flex-col items-center font-pixel text-xs text-white/70 hover:text-neon-cyan transition-colors"
          active-class="!text-neon-pink"
          exact-active-class="!text-neon-pink"
        >
          <span class="text-xl mb-1">🏠</span>
          <span>HOME</span>
        </RouterLink>
        <RouterLink
          to="/roulette"
          class="flex flex-col items-center font-pixel text-xs text-white/70 hover:text-neon-cyan transition-colors"
          active-class="!text-neon-pink"
        >
          <span class="text-xl mb-1">🎰</span>
          <span>PLAY</span>
        </RouterLink>
        <RouterLink
          to="/menu"
          class="flex flex-col items-center font-pixel text-xs text-white/70 hover:text-neon-cyan transition-colors"
          active-class="!text-neon-pink"
        >
          <span class="text-xl mb-1">📋</span>
          <span>MENU</span>
        </RouterLink>
        <RouterLink
          to="/history"
          class="flex flex-col items-center font-pixel text-xs text-white/70 hover:text-neon-cyan transition-colors"
          active-class="!text-neon-pink"
        >
          <span class="text-xl mb-1">📜</span>
          <span>LOG</span>
        </RouterLink>
      </div>
    </nav>

    <!-- 메인 컨텐츠 -->
    <main class="pb-20">
      <ErrorBoundary>
        <RouterView />
      </ErrorBoundary>
    </main>
  </div>
</template>
