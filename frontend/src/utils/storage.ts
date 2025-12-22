/**
 * LocalStorage 유틸리티
 * 공통 스토리지 로직 추출
 */

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        return JSON.parse(stored) as T
      }
      return fallback
    } catch {
      return fallback
    }
  },

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
  },

  remove(key: string): void {
    localStorage.removeItem(key)
  },
}
