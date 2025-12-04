<script setup lang="ts">
import type { IPlace } from '@/types/map'
import { useKakaoMap } from '@/composables/useKakaoMap'

interface Props {
  place: IPlace
  index?: number
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
})

const emit = defineEmits<{
  showMap: [place: IPlace]
}>()

const { formatDistance } = useKakaoMap()

const openKakaoMap = () => {
  window.open(props.place.url, '_blank')
}

const handleShowMap = () => {
  emit('showMap', props.place)
}
</script>

<template>
  <div
    class="place-card p-4 border-2 border-neon-cyan/50 bg-retro-card/80
           hover:border-neon-cyan hover:shadow-neon-cyan transition-all duration-300"
    :style="{ animationDelay: `${index * 0.1}s` }"
  >
    <div class="flex items-start justify-between gap-3">
      <!-- 정보 영역 -->
      <div class="flex-1 min-w-0">
        <!-- 가게명 -->
        <h3 class="font-korean text-lg text-neon-yellow truncate">
          {{ place.name }}
        </h3>

        <!-- 카테고리 & 거리 -->
        <div class="flex items-center gap-2 mt-1">
          <span class="font-pixel text-xs text-neon-pink">
            {{ formatDistance(place.distance) }}
          </span>
          <span class="text-white/30">|</span>
          <span class="font-korean text-xs text-white/60 truncate">
            {{ place.category.split(' > ').pop() }}
          </span>
        </div>

        <!-- 주소 -->
        <p class="font-korean text-sm text-white/70 mt-2 truncate">
          {{ place.roadAddress || place.address }}
        </p>

        <!-- 전화번호 -->
        <p v-if="place.phone" class="font-pixel text-xs text-neon-green mt-1">
          {{ place.phone }}
        </p>
      </div>

      <!-- 버튼 영역 -->
      <div class="flex flex-col gap-2">
        <button
          @click="handleShowMap"
          class="px-3 py-2 border-2 border-neon-cyan font-pixel text-xs text-neon-cyan
                 hover:bg-neon-cyan/20 hover:shadow-neon-cyan transition-all"
          title="지도에서 보기"
        >
          MAP
        </button>
        <button
          @click="openKakaoMap"
          class="px-3 py-2 border-2 border-neon-orange font-pixel text-xs text-neon-orange
                 hover:bg-neon-orange/20 hover:shadow-neon-orange transition-all"
          title="카카오맵에서 보기"
        >
          LINK
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.place-card {
  animation: fadeInUp 0.3s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
