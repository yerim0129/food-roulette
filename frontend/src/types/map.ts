// 위치 정보
export interface ILocation {
  lat: number
  lng: number
}

// 카카오맵 장소 정보
export interface IPlace {
  id: string
  name: string           // 장소명
  category: string       // 카테고리
  address: string        // 지번 주소
  roadAddress: string    // 도로명 주소
  phone: string          // 전화번호
  distance: string       // 거리 (미터)
  url: string            // 카카오맵 URL
  x: string              // 경도
  y: string              // 위도
}

// 카카오맵 SDK 타입
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void
        LatLng: new (lat: number, lng: number) => KakaoLatLng
        Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap
        Marker: new (options: KakaoMarkerOptions) => KakaoMarker
        InfoWindow: new (options: KakaoInfoWindowOptions) => KakaoInfoWindow
        services: {
          Places: new () => KakaoPlaces
          Status: {
            OK: string
            ZERO_RESULT: string
            ERROR: string
          }
        }
      }
    }
  }
}

export interface KakaoLatLng {
  getLat: () => number
  getLng: () => number
}

export interface KakaoMapOptions {
  center: KakaoLatLng
  level: number
}

export interface KakaoMap {
  setCenter: (latlng: KakaoLatLng) => void
  setLevel: (level: number) => void
  getCenter: () => KakaoLatLng
}

export interface KakaoMarkerOptions {
  position: KakaoLatLng
  map?: KakaoMap
}

export interface KakaoMarker {
  setMap: (map: KakaoMap | null) => void
  getPosition: () => KakaoLatLng
}

export interface KakaoInfoWindowOptions {
  content: string
  removable?: boolean
}

export interface KakaoInfoWindow {
  open: (map: KakaoMap, marker: KakaoMarker) => void
  close: () => void
}

export interface KakaoPlaces {
  keywordSearch: (
    keyword: string,
    callback: (result: KakaoPlaceResult[], status: string) => void,
    options?: KakaoSearchOptions
  ) => void
}

export interface KakaoPlaceResult {
  id: string
  place_name: string
  category_name: string
  category_group_code: string
  category_group_name: string
  phone: string
  address_name: string
  road_address_name: string
  x: string
  y: string
  place_url: string
  distance: string
}

export interface KakaoSearchOptions {
  location?: KakaoLatLng
  radius?: number
  size?: number
  page?: number
  sort?: 'distance' | 'accuracy'
}
