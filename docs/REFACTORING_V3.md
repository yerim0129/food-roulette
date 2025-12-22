# 리팩토링 3차 작업

## 개요
이전 성능 최적화 결과를 바탕으로 코드 품질 개선을 위한 리팩토링을 진행했습니다.

---

## 체크리스트

### 1단계: 미사용 파일/코드 삭제
- [x] RetroHeader.vue 삭제 (미사용)
- [x] RetroCard.vue 삭제 (미사용)
- [x] 빈 layout/ 폴더 삭제
- [x] RetroButton.vue TODO 주석 제거

### 2단계: 중복 코드 유틸/훅으로 통합
- [x] Backend: validation.ts 유틸 생성 (isValidPositiveInt, 길이 상수)
- [x] Frontend: storage.ts 유틸 생성 (localStorage 공통 로직)
- [x] historyStore.ts - storage 유틸 적용
- [x] menuStore.ts - storage 유틸 적용

### 3단계: 컴포넌트 구조 정리
- [x] 확인 결과 이미 잘 구조화됨 (common/, map/, menu/, roulette/)

### 4단계: 타입 정의 보강
- [x] HistoryItem 타입을 types/index.ts로 이동

---

## 수정 상세 내역

### 1. 미사용 컴포넌트 삭제

**삭제된 파일:**
- `frontend/src/components/layout/RetroHeader.vue` - 어디서도 import되지 않음
- `frontend/src/components/common/RetroCard.vue` - 어디서도 import되지 않음
- `frontend/src/components/layout/` - 빈 폴더

**영향 범위:** 없음 (미사용 파일)

---

### 2. Backend 검증 유틸 통합

**문제점:**
- `menus.ts`와 `history.ts`에서 동일한 검증 로직이 중복
- 길이 제한 상수가 각 파일에 분산

**해결:**
`backend/src/utils/validation.ts` 생성

```typescript
// 유효한 양의 정수인지 확인
export const isValidPositiveInt = (value: unknown): boolean => {
  const num = Number(value)
  return !isNaN(num) && Number.isInteger(num) && num > 0
}

// 문자열 길이 제한 상수
export const MAX_NAME_LENGTH = 50
export const MAX_EMOJI_LENGTH = 4
export const MAX_DESCRIPTION_LENGTH = 200
export const MAX_URL_LENGTH = 500
export const MAX_HISTORY_LIMIT = 100
```

**수정 파일:**
- `backend/src/utils/validation.ts` (신규)
- `backend/src/routes/menus.ts` - 중복 코드 제거, 유틸 import
- `backend/src/routes/history.ts` - 중복 코드 제거, 유틸 import

---

### 3. Frontend Storage 유틸 통합

**문제점:**
- `historyStore.ts`와 `menuStore.ts`에서 동일한 localStorage 로직 중복
- try-catch 패턴 반복

**해결:**
`frontend/src/utils/storage.ts` 생성

```typescript
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
```

**Before (historyStore.ts):**
```typescript
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // ...
    }
  } catch {
    history.value = []
  }
}

const saveToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
}
```

**After (historyStore.ts):**
```typescript
import { storage } from '@/utils/storage'

const loadFromStorage = () => {
  const stored = storage.get<HistoryItem[]>(STORAGE_KEY, [])
  history.value = stored.map((item) => ({
    ...item,
    createdAt: new Date(item.createdAt),
  }))
  // ...
}

const saveToStorage = () => {
  storage.set(STORAGE_KEY, history.value)
}
```

**수정 파일:**
- `frontend/src/utils/storage.ts` (신규)
- `frontend/src/stores/historyStore.ts` - storage 유틸 적용
- `frontend/src/stores/menuStore.ts` - storage 유틸 적용

---

### 4. 타입 정의 중앙화

**문제점:**
- `HistoryItem` 인터페이스가 `historyStore.ts`에 정의됨
- 타입 정의가 분산되어 관리 어려움

**해결:**
`HistoryItem`을 `types/index.ts`로 이동

**Before:**
```typescript
// historyStore.ts
export interface HistoryItem {
  id: number
  food: Food
  createdAt: Date
}
```

**After:**
```typescript
// types/index.ts
export interface HistoryItem {
  id: number
  food: Food
  createdAt: Date
}

// historyStore.ts
import type { Food, HistoryItem } from '@/types'
```

**수정 파일:**
- `frontend/src/types/index.ts` - HistoryItem 추가
- `frontend/src/stores/historyStore.ts` - import 수정

---

## 요약

| 작업 항목 | 상태 | 영향 범위 |
|----------|------|----------|
| 미사용 파일 삭제 | 완료 | 없음 |
| Backend 검증 유틸 통합 | 완료 | menus.ts, history.ts |
| Frontend Storage 유틸 통합 | 완료 | historyStore.ts, menuStore.ts |
| 타입 정의 중앙화 | 완료 | types/index.ts, historyStore.ts |

---

## 빌드 검증

Frontend & Backend 빌드 성공 확인

```
Frontend: ✓ built in 2.40s
Backend: Done in 2.01s
```
