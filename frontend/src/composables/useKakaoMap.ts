import { ref } from 'vue'
import type { ILocation, IPlace, KakaoPlaceResult } from '@/types/map'

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY

// SDK 로드 상태
const isLoaded = ref(false)
const isLoading = ref(false)

export function useKakaoMap() {
  const error = ref<string | null>(null)
  const currentLocation = ref<ILocation | null>(null)

  // 카카오맵 SDK 동적 로딩
  const loadKakaoMapSDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // 이미 로드됨
      if (isLoaded.value && window.kakao?.maps) {
        resolve()
        return
      }

      // 로딩 중
      if (isLoading.value) {
        const checkLoaded = setInterval(() => {
          if (isLoaded.value) {
            clearInterval(checkLoaded)
            resolve()
          }
        }, 100)
        return
      }

      if (!KAKAO_MAP_KEY || KAKAO_MAP_KEY === 'YOUR_KAKAO_MAP_JAVASCRIPT_KEY') {
        reject(new Error('카카오맵 API 키가 설정되지 않았습니다.'))
        return
      }

      isLoading.value = true

      const script = document.createElement('script')
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&libraries=services&autoload=false`
      script.async = true

      script.onload = () => {
        window.kakao.maps.load(() => {
          isLoaded.value = true
          isLoading.value = false
          resolve()
        })
      }

      script.onerror = () => {
        isLoading.value = false
        reject(new Error('카카오맵 SDK 로딩 실패'))
      }

      document.head.appendChild(script)
    })
  }

  // 카카오맵 SDK 초기화
  const initKakaoMap = async (): Promise<boolean> => {
    try {
      error.value = null
      await loadKakaoMapSDK()
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : '카카오맵 초기화 실패'
      return false
    }
  }

  // 현재 위치 가져오기
  const getCurrentLocation = (): Promise<ILocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('이 브라우저에서는 위치 서비스를 지원하지 않습니다.'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: ILocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          currentLocation.value = location
          resolve(location)
        },
        (err) => {
          let message = '위치를 가져올 수 없습니다.'
          switch (err.code) {
            case err.PERMISSION_DENIED:
              message = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'
              break
            case err.POSITION_UNAVAILABLE:
              message = '위치 정보를 사용할 수 없습니다.'
              break
            case err.TIMEOUT:
              message = '위치 요청 시간이 초과되었습니다.'
              break
          }
          error.value = message
          reject(new Error(message))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5분 캐시
        }
      )
    })
  }

  // 키워드로 장소 검색
  const searchPlaces = async (
    keyword: string,
    location?: ILocation
  ): Promise<IPlace[]> => {
    try {
      error.value = null

      // SDK 초기화
      const initialized = await initKakaoMap()
      if (!initialized) {
        throw new Error(error.value || '카카오맵 초기화 실패')
      }

      // 위치가 없으면 현재 위치 가져오기
      const searchLocation = location || currentLocation.value || await getCurrentLocation()

      return new Promise((resolve, reject) => {
        const places = new window.kakao.maps.services.Places()
        const kakaoLocation = new window.kakao.maps.LatLng(
          searchLocation.lat,
          searchLocation.lng
        )

        places.keywordSearch(
          keyword,
          (result: KakaoPlaceResult[], status: string) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const placeList: IPlace[] = result.map((item) => ({
                id: item.id,
                name: item.place_name,
                category: item.category_name,
                address: item.address_name,
                roadAddress: item.road_address_name,
                phone: item.phone,
                distance: item.distance,
                url: item.place_url,
                x: item.x,
                y: item.y,
              }))
              resolve(placeList)
            } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
              resolve([])
            } else {
              reject(new Error('장소 검색에 실패했습니다.'))
            }
          },
          {
            location: kakaoLocation,
            radius: 3000, // 3km 반경
            size: 10,
            sort: 'distance',
          }
        )
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : '장소 검색 실패'
      throw e
    }
  }

  // 거리 포맷팅 (m -> km)
  const formatDistance = (distance: string): string => {
    const meters = parseInt(distance, 10)
    if (isNaN(meters)) return distance
    if (meters < 1000) {
      return `${meters}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }

  return {
    isLoaded,
    isLoading,
    error,
    currentLocation,
    initKakaoMap,
    getCurrentLocation,
    searchPlaces,
    formatDistance,
  }
}
