<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface Props {
  showNav?: boolean
}

withDefaults(defineProps<Props>(), {
  showNav: true,
})
</script>

<template>
  <header class="py-6 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- 메인 타이틀 -->
      <RouterLink to="/" class="block text-center group">
        <h1 class="font-pixel text-2xl md:text-4xl tracking-wider animate-glow">
          <span class="text-neon-yellow drop-shadow-[0_0_10px_#fffc00]">FOOD</span>
          <span class="text-neon-pink drop-shadow-[0_0_10px_#ff2d6a] ml-2">ROULETTE</span>
        </h1>
        <p class="font-korean text-neon-cyan text-sm mt-2 opacity-80">
          오늘 뭐 먹지?
        </p>
      </RouterLink>

      <!-- 네비게이션 -->
      <nav v-if="showNav" class="mt-6 flex justify-center gap-4">
        <RouterLink
          to="/"
          class="nav-link"
          active-class="nav-link-active"
        >
          HOME
        </RouterLink>
        <RouterLink
          to="/roulette"
          class="nav-link"
          active-class="nav-link-active"
        >
          PLAY
        </RouterLink>
        <RouterLink
          to="/history"
          class="nav-link"
          active-class="nav-link-active"
        >
          HISTORY
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.nav-link {
  font-family: var(--font-pixel);
  font-size: 0.75rem;
  padding: 0.5rem 1rem;
  color: white;
  opacity: 0.7;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.nav-link:hover {
  opacity: 1;
  color: #00fff2;
}

.nav-link-active {
  opacity: 1;
  color: #ff2d6a;
  border-bottom-color: #ff2d6a;
  text-shadow: 0 0 10px #ff2d6a;
}
</style>
