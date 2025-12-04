<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import type { IPlace, KakaoMap, KakaoMarker, KakaoInfoWindow } from '@/types/map'
import { useKakaoMap } from '@/composables/useKakaoMap'
import RetroButton from '@/components/common/RetroButton.vue'

interface Props {
  modelValue: boolean
  place: IPlace | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { initKakaoMap, formatDistance } = useKakaoMap()

const mapContainer = ref<HTMLDivElement | null>(null)
const mapInstance = ref<KakaoMap | null>(null)
const markerInstance = ref<KakaoMarker | null>(null)
const infoWindowInstance = ref<KakaoInfoWindow | null>(null)
const isMapLoading = ref(false)
const mapError = ref<string | null>(null)

// 지도 렌더링
const renderMap = async () => {
  if (!props.place || !mapContainer.value) return

  isMapLoading.value = true
  mapError.value = null

  try {
    const initialized = await initKakaoMap()
    if (!initialized) {
      mapError.value = '카카오맵을 불러올 수 없습니다.'
      return
    }

    await nextTick()

    const lat = parseFloat(props.place.y)
    const lng = parseFloat(props.place.x)
    const position = new window.kakao.maps.LatLng(lat, lng)

    // 지도 생성
    mapInstance.value = new window.kakao.maps.Map(mapContainer.value, {
      center: position,
      level: 3,
    })

    // 마커 생성
    markerInstance.value = new window.kakao.maps.Marker({
      position,
      map: mapInstance.value,
    })

    // 인포윈도우 생성
    const infoContent = `
      <div style="padding: 10px; min-width: 150px; font-family: sans-serif;">
        <strong style="color: #ff2d6a;">${props.place.name}</strong>
        <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">
          ${props.place.roadAddress || props.place.address}
        </p>
      </div>
    `
    infoWindowInstance.value = new window.kakao.maps.InfoWindow({
      content: infoContent,
      removable: true,
    })
    infoWindowInstance.value.open(mapInstance.value, markerInstance.value)

  } catch (e) {
    mapError.value = '지도를 불러오는 중 오류가 발생했습니다.'
    console.error('Map render error:', e)
  } finally {
    isMapLoading.value = false
  }
}

// 정리
const cleanupMap = () => {
  if (infoWindowInstance.value) {
    infoWindowInstance.value.close()
    infoWindowInstance.value = null
  }
  if (markerInstance.value) {
    markerInstance.value.setMap(null)
    markerInstance.value = null
  }
  mapInstance.value = null
}

// 모달 열릴 때 지도 렌더링
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen && props.place) {
    await nextTick()
    renderMap()
  } else {
    cleanupMap()
  }
})

// 카카오맵 열기
const openKakaoMap = () => {
  if (props.place) {
    window.open(props.place.url, '_blank')
  }
}

// 모달 닫기
const close = () => {
  emit('update:modelValue', false)
}

// ESC 키로 닫기
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

// 이벤트 리스너
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
  cleanupMap()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue && place"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- 백드롭 -->
        <div
          class="absolute inset-0 bg-black/80 backdrop-blur-sm"
          @click="close"
        />

        <!-- 모달 -->
        <div
          class="relative w-full max-w-lg bg-retro-bg border-4 border-neon-cyan
                 shadow-neon-cyan z-10"
        >
          <!-- 헤더 -->
          <div class="flex items-center justify-between p-4 border-b-2 border-neon-cyan/50">
            <div>
              <h2 class="font-pixel text-sm text-neon-cyan">MAP VIEW</h2>
              <p class="font-korean text-lg text-neon-yellow mt-1">
                {{ place.name }}
              </p>
            </div>
            <button
              @click="close"
              class="w-8 h-8 flex items-center justify-center border-2 border-neon-pink
                     text-neon-pink hover:bg-neon-pink/20 transition-colors"
            >
              ✕
            </button>
          </div>

          <!-- 지도 영역 -->
          <div class="relative">
            <!-- 로딩 -->
            <div
              v-if="isMapLoading"
              class="absolute inset-0 flex items-center justify-center bg-retro-bg z-10"
            >
              <div class="text-center">
                <div class="loading-dots flex justify-center gap-2 mb-3">
                  <span class="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style="animation-delay: 0s;"></span>
                  <span class="w-2 h-2 bg-neon-pink rounded-full animate-bounce" style="animation-delay: 0.1s;"></span>
                  <span class="w-2 h-2 bg-neon-yellow rounded-full animate-bounce" style="animation-delay: 0.2s;"></span>
                </div>
                <p class="font-pixel text-xs text-white/70">LOADING MAP...</p>
              </div>
            </div>

            <!-- 에러 -->
            <div
              v-else-if="mapError"
              class="h-64 flex items-center justify-center"
            >
              <div class="text-center">
                <p class="text-3xl mb-2">⚠️</p>
                <p class="font-korean text-sm text-neon-pink">{{ mapError }}</p>
              </div>
            </div>

            <!-- 지도 컨테이너 -->
            <div
              ref="mapContainer"
              class="w-full h-64"
            />
          </div>

          <!-- 정보 -->
          <div class="p-4 border-t-2 border-neon-cyan/50">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <p class="font-korean text-sm text-white/70">
                  {{ place.roadAddress || place.address }}
                </p>
                <div class="flex items-center gap-3 mt-2">
                  <span class="font-pixel text-xs text-neon-pink">
                    {{ formatDistance(place.distance) }}
                  </span>
                  <span v-if="place.phone" class="font-pixel text-xs text-neon-green">
                    {{ place.phone }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 푸터 -->
          <div class="flex gap-3 p-4 border-t-2 border-neon-cyan/50">
            <RetroButton
              variant="cyan"
              size="sm"
              class="flex-1"
              @click="close"
            >
              CLOSE
            </RetroButton>
            <RetroButton
              variant="pink"
              size="sm"
              class="flex-1"
              @click="openKakaoMap"
            >
              KAKAO MAP
            </RetroButton>
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
