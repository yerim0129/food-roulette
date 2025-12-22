# 최적화 변경 내역

## 개요
성능 분석 결과 발견된 이슈들을 수정한 내역입니다.

---

## 체크리스트

### Critical (높음)
- [x] .gitignore 파일 생성
- [x] 카테고리 데이터 중복 제거 (roulette.ts → menuStore 참조)
- [x] 백엔드 입력값 유효성 검증 추가 (menus.ts, history.ts)

### Medium (중간)
- [x] deep watch 최적화 - `RouletteView.vue`에서 `menuStore.menus` 감시
- [x] DB 인덱스 추가 - `History.createdAt`, `Menu.categoryId`
- [x] 에러 바운더리 - 전역 에러 처리 컴포넌트

### Low (낮음)
- [ ] 코드 스플리팅 추가 검토
- [ ] 이미지 lazy loading 적용
- [ ] API 응답 캐싱 검토

---

## 수정 상세 내역

### 1. .gitignore 파일 생성

**문제점**
- `.gitignore` 파일이 없어 민감한 파일들이 Git에 노출될 위험
- `.env` 파일의 API 키, 데이터베이스 파일 등이 커밋될 수 있음

**해결**
`.gitignore` 파일을 생성하여 다음 항목들을 제외:

```
# Dependencies
node_modules/

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.*.local

# Database
*.db
*.db-journal
prisma/*.db

# IDE
.vscode/*
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
```

**수정 파일**
- `.gitignore` (신규 생성)

---

### 2. 카테고리 데이터 중복 제거

**문제점**
- `roulette.ts`와 `menuStore.ts`에서 동일한 카테고리 데이터를 각각 관리
- 데이터 불일치 가능성 및 유지보수 어려움

**해결**
`roulette.ts`에서 중복 카테고리 데이터를 제거하고 `menuStore`를 참조하도록 변경

**Before (roulette.ts):**
```typescript
const categories = ref<Category[]>([
  { id: 1, name: '한식', emoji: '🍚', active: true },
  { id: 2, name: '중식', emoji: '🥟', active: true },
  // ... 중복 데이터
])
```

**After (roulette.ts):**
```typescript
import { useMenuStore } from './menuStore'

const menuStore = useMenuStore()
const categories = computed(() => menuStore.categories)

const toggleCategory = (categoryId: number) => {
  menuStore.toggleCategory(categoryId)
}
```

**수정 파일**
- `frontend/src/stores/roulette.ts` - 중복 데이터 제거, menuStore 참조
- `frontend/src/stores/menuStore.ts` - `toggleCategory` 액션 추가

---

### 3. 백엔드 입력값 유효성 검증 추가

**문제점**
- API 엔드포인트에서 입력값 검증 없이 `Number()` 변환 수행
- 잘못된 입력값(문자열, 음수, 소수점 등)으로 인한 보안 취약점 및 오류 가능성

**해결**
모든 API 라우트에 입력값 유효성 검증 로직 추가

**검증 함수:**
```typescript
const isValidPositiveInt = (value: unknown): boolean => {
  const num = Number(value)
  return !isNaN(num) && Number.isInteger(num) && num > 0
}
```

**적용된 검증:**

#### menus.ts
| 엔드포인트 | 검증 항목 |
|-----------|----------|
| GET /api/menus | categoryId (선택적) |
| GET /api/menus/:id | id |
| POST /api/menus | categoryId, name, emoji (타입 검증) |
| PUT /api/menus/:id | id, categoryId (선택적) |
| DELETE /api/menus/:id | id |

#### history.ts
| 엔드포인트 | 검증 항목 |
|-----------|----------|
| GET /api/history | limit (선택적) |
| POST /api/history | menuId |
| DELETE /api/history/:id | id |

**에러 응답 예시:**
```json
{
  "error": "id must be a positive integer"
}
```

**수정 파일**
- `backend/src/routes/menus.ts` - 모든 라우트에 검증 추가
- `backend/src/routes/history.ts` - 모든 라우트에 검증 추가

---

### 4. deep watch 최적화

**문제점**
- `RouletteView.vue`에서 `menuStore.menus`를 `{ deep: true }` 옵션으로 감시
- 배열 내부 객체의 모든 속성 변경에 반응하여 불필요한 리렌더링 발생

**해결**
deep watch 대신 배열 길이 변화만 감지하도록 변경

**Before:**
```typescript
watch(() => menuStore.menus, (newMenus) => {
  setFoods(newMenus)
}, { deep: true })
```

**After:**
```typescript
watch(() => menuStore.menus.length, () => {
  setFoods(menuStore.menus)
})
```

**수정 파일**
- `frontend/src/views/RouletteView.vue`

---

### 5. DB 인덱스 추가

**문제점**
- `History` 테이블의 `createdAt` 필드로 정렬 쿼리 시 풀 테이블 스캔
- `Menu` 테이블의 `categoryId` 필드로 필터링 시 성능 저하 가능

**해결**
Prisma 스키마에 인덱스 추가

```prisma
model Menu {
  // ... fields
  @@index([categoryId])
}

model History {
  // ... fields
  @@index([createdAt])
  @@index([menuId])
}
```

**수정 파일**
- `backend/prisma/schema.prisma`

**참고**: 인덱스 적용을 위해 `npx prisma db push` 또는 `npx prisma migrate dev` 실행 필요

---

### 6. 에러 바운더리 컴포넌트 추가

**문제점**
- 컴포넌트 렌더링 중 에러 발생 시 전체 앱 크래시
- 사용자에게 친화적인 에러 화면 미제공

**해결**
Vue의 `onErrorCaptured` 훅을 사용한 ErrorBoundary 컴포넌트 생성 및 적용

**ErrorBoundary.vue:**
```vue
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)
const hasError = ref(false)

onErrorCaptured((err: Error) => {
  error.value = err
  hasError.value = true
  return false
})
</script>

<template>
  <div v-if="hasError" class="error-boundary">
    <!-- 레트로 스타일 에러 화면 -->
  </div>
  <slot v-else />
</template>
```

**App.vue 적용:**
```vue
<main class="pb-20">
  <ErrorBoundary>
    <RouterView />
  </ErrorBoundary>
</main>
```

**수정 파일**
- `frontend/src/components/common/ErrorBoundary.vue` (신규 생성)
- `frontend/src/App.vue`

---

## 요약

| 수정 항목 | 우선순위 | 상태 |
|----------|---------|------|
| .gitignore 생성 | Critical | 완료 |
| 카테고리 중복 제거 | Critical | 완료 |
| 입력값 유효성 검증 | Critical | 완료 |
| deep watch 최적화 | Medium | 완료 |
| DB 인덱스 추가 | Medium | 완료 |
| 에러 바운더리 | Medium | 완료 |
