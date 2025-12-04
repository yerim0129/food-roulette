<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { IPlace } from '@/types/map'
import { useKakaoMap } from '@/composables/useKakaoMap'
import PlaceCard from './PlaceCard.vue'
import MapModal from './MapModal.vue'
import RetroButton from '@/components/common/RetroButton.vue'

interface Props {
  keyword: string
  autoSearch?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoSearch: false,
})

const { searchPlaces, error } = useKakaoMap()

const places = ref<IPlace[]>([])
const isSearching = ref(false)
const hasSearched = ref(false)
const showMapModal = ref(false)
const selectedPlace = ref<IPlace | null>(null)

// 검색 실행
const doSearch = async () => {
  if (!props.keyword || isSearching.value) return

  isSearching.value = true
  hasSearched.value = false
  places.value = []

  try {
    const searchKeyword = `${props.keyword} 맛집`
    const results = await searchPlaces(searchKeyword)
    places.value = results
    hasSearched.value = true
  } catch (e) {
    console.error('Search failed:', e)
  } finally {
    isSearching.value = false
  }
}

// 지도 모달 열기
const handleShowMap = (place: IPlace) => {
  selectedPlace.value = place
  showMapModal.value = true
}

// 자동 검색
watch(() => props.keyword, () => {
  if (props.autoSearch && props.keyword) {
    doSearch()
  }
})

onMounted(() => {
  if (props.autoSearch && props.keyword) {
    doSearch()
  }
})
</script>

<template>
  <div class="nearby-restaurants">
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-pixel text-sm text-neon-cyan">
        NEARBY RESTAURANTS
      </h3>
      <RetroButton
        v-if="!autoSearch"
        variant="cyan"
        size="sm"
        :disabled="isSearching || !keyword"
        @click="doSearch"
      >
        {{ isSearching ? 'SEARCHING...' : 'SEARCH' }}
      </RetroButton>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="isSearching" class="text-center py-8">
      <div class="loading-dots flex justify-center gap-2 mb-4">
        <span class="w-3 h-3 bg-neon-cyan rounded-full animate-bounce" style="animation-delay: 0s;"></span>
        <span class="w-3 h-3 bg-neon-pink rounded-full animate-bounce" style="animation-delay: 0.1s;"></span>
        <span class="w-3 h-3 bg-neon-yellow rounded-full animate-bounce" style="animation-delay: 0.2s;"></span>
      </div>
      <p class="font-pixel text-xs text-white/70 animate-pulse">
        SEARCHING...
      </p>
      <p class="font-korean text-sm text-white/50 mt-2">
        "{{ keyword }}" 근처 맛집을 찾고 있습니다
      </p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="text-center py-8 px-4 border-2 border-neon-pink/50 bg-neon-pink/10">
      <p class="text-3xl mb-3">⚠️</p>
      <p class="font-pixel text-xs text-neon-pink mb-2">ERROR</p>
      <p class="font-korean text-sm text-white/70">
        {{ error }}
      </p>
      <RetroButton
        variant="pink"
        size="sm"
        class="mt-4"
        @click="doSearch"
      >
        RETRY
      </RetroButton>
    </div>

    <!-- 결과 없음 -->
    <div
      v-else-if="hasSearched && places.length === 0"
      class="text-center py-8"
    >
      <p class="text-3xl mb-3">🍽️</p>
      <p class="font-pixel text-xs text-neon-yellow mb-2">NO RESULTS</p>
      <p class="font-korean text-sm text-white/50">
        "{{ keyword }}" 관련 맛집을 찾을 수 없습니다
      </p>
    </div>

    <!-- 결과 리스트 -->
    <div v-else-if="places.length > 0" class="space-y-3">
      <p class="font-pixel text-xs text-white/50 mb-3">
        {{ places.length }} PLACES FOUND
      </p>
      <PlaceCard
        v-for="(place, index) in places"
        :key="place.id"
        :place="place"
        :index="index"
        @show-map="handleShowMap"
      />
    </div>

    <!-- 초기 상태 (검색 전) -->
    <div
      v-else-if="!hasSearched && !autoSearch"
      class="text-center py-8"
    >
      <p class="text-3xl mb-3">📍</p>
      <p class="font-korean text-sm text-white/50">
        버튼을 눌러 근처 맛집을 검색하세요
      </p>
    </div>

    <!-- 지도 모달 -->
    <MapModal
      v-model="showMapModal"
      :place="selectedPlace"
    />
  </div>
</template>

<style scoped>
.loading-dots span {
  animation-duration: 0.6s;
}
</style>
