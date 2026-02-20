# Skills 로드맵

이 프로젝트에서 만들면 좋은 스킬 목록입니다.
완료된 항목은 체크하고, 새 아이디어가 생기면 추가하세요.

스킬은 4가지 유형으로 나뉩니다:
- **검증 (verify-*)** — 코드가 규칙을 지키는지 검사
- **자동화 (generate-* / add-*)** — 반복 작업을 명령어 하나로 처리
- **생성 (create-*)** — boilerplate를 프로젝트 규칙대로 만들어주기
- **분석 (analyze-*)** — 코드나 데이터를 읽고 인사이트 제공

---

## 검증 스킬 (verify-*)

### Phase 1 — 지금 바로

파일이 충분히 쌓여 있어서 규칙을 추출하기 좋은 시점입니다.

#### [ ] `verify-stores`

Pinia store 3개(`menuStore.ts`, `historyStore.ts`, `roulette.ts`)가 일관된 규칙을 따르는지 검사합니다.

검사할 규칙:
- `defineStore('이름', () => { ... })` Setup Store 형태 사용
- localStorage 접근은 반드시 `utils/storage.ts`를 통해서만 (`localStorage.` 직접 접근 금지)
- store 간 참조 시 store 내부에서 다른 store 직접 호출 허용 여부 일관성 확인
  - 현재 `roulette.ts`가 내부에서 `useMenuStore()` 호출 중 → 이 패턴을 규칙으로 확정하거나 금지
- `export const use~Store` 형태로 export
- 모든 public 상태/액션이 return문에 명시

```
/manage-skills stores
```

---

#### [ ] `verify-components`

Vue 컴포넌트 10개(`components/`, `views/`)의 작성 규칙을 검사합니다.

검사할 규칙:
- 모든 컴포넌트가 `<script setup lang="ts">` 사용
- 파일명이 PascalCase (`MenuCard.vue`, `RetroButton.vue` 등)
- 레트로 테마 CSS 클래스 사용 (`btn-neon`, `retro-box`, `retro-title`, `slot-window`, `category-tag` 등) — 인라인 `style=""` 금지
- `defineProps`, `defineEmits`에 TypeScript 타입 명시 (런타임 타입 선언 금지)
- `font-pixel`, `font-arcade` 등 커스텀 폰트 클래스 일관성 확인

```
/manage-skills components
```

---

#### [ ] `verify-api`

Express 라우트 3개(`categories.ts`, `menus.ts`, `history.ts`)의 일관성을 검사합니다.

검사할 규칙:
- 모든 라우트 핸들러에 try/catch 에러 핸들링 존재
- Prisma 클라이언트는 `lib/prisma.ts`에서만 import (`new PrismaClient()` 직접 생성 금지)
- `utils/validation.ts` 유틸 활용 여부
- 응답 형태 일관성 (`{ data: ... }` 또는 `{ error: ... }`)
- HTTP 상태코드 일관성 (성공: 200/201, 실패: 400/404/500)

```
/manage-skills api
```

---

#### [ ] `verify-types`

TypeScript 타입 정의의 위치와 사용 일관성을 검사합니다.

검사할 규칙:
- 공유 타입은 반드시 `types/index.ts` 또는 `types/map.ts`에 정의 (파일 내 인라인 interface 선언 금지)
- `Food`, `Category`, `HistoryItem` 타입을 `@/types`에서 import
- 카카오맵 관련 타입(`ILocation`, `IPlace`, `KakaoPlaceResult`)은 `types/map.ts`에서 import
- `any` 타입 사용 금지 (strict 모드 보완)

```
/manage-skills types
```

---

### Phase 2 — 기능 완성 후

#### [ ] `verify-kakaomap`

카카오맵 기능이 안정화된 후 composable과 map 컴포넌트 3개의 사용 규칙을 검사합니다.

검사할 규칙:
- 카카오맵 API는 반드시 `useKakaoMap` composable을 통해서만 접근
- `window.kakao` 직접 접근은 `useKakaoMap.ts` 내부에서만 허용
- `types/map.ts` 타입 정의 활용 (인라인 타입 선언 금지)
- SDK 로딩 전 API 호출 방지 패턴 (`isLoaded` 체크) 확인

```
/manage-skills kakaomap
```

---

## 자동화 스킬

반복되는 개발 작업을 명령어 하나로 처리합니다.

#### [ ] `add-menu-category`

새 카테고리 추가 시 수정해야 할 파일이 여러 곳이라 실수가 생기기 쉬운 작업을 자동화합니다.

자동화할 작업:
1. `menuStore.ts`의 `categories` 배열에 새 카테고리 추가 (id 자동 계산)
2. `types/index.ts`의 `Category` 타입 변경 필요 여부 확인
3. backend를 사용 중이면 `prisma/seed.ts`에도 추가 안내
4. 추가 완료 후 영향받는 파일 목록 출력

사용 예:
```
/add-menu-category 디저트 🍰
```

---

#### [ ] `add-food-item`

특정 카테고리에 음식을 일괄 추가하는 플로우를 자동화합니다.

자동화할 작업:
1. `menuStore.ts`의 `defaultMenus` 배열에 food 데이터 추가 (id 자동 계산)
2. categoryId 유효성 확인 (존재하는 카테고리인지)
3. emoji 중복 여부 경고
4. 추가 후 해당 카테고리 전체 목록 출력

사용 예:
```
/add-food-item 한식 마라탕 🍲
```

---

#### [ ] `reset-history`

개발 중 localStorage 히스토리 데이터가 지저분해졌을 때 초기화 방법을 안내합니다.

자동화할 작업:
1. `historyStore.ts`에서 사용하는 storage key 확인
2. localStorage 초기화 코드 스니펫 제공 (브라우저 콘솔용)
3. `storage.remove()` 호출 위치 안내

---

## 생성 스킬 (create-*)

boilerplate를 프로젝트 규칙대로 자동 생성합니다.

#### [ ] `create-store`

이 프로젝트의 Pinia store 규칙(`menuStore.ts` 패턴)에 맞춰 새 store 파일을 생성합니다.

생성되는 것:
- `frontend/src/stores/<name>Store.ts`
- `defineStore` Setup Store 형태
- `storage.ts` 연동 boilerplate (필요 시)
- `types/index.ts`에 필요한 타입 추가 안내

사용 예:
```
/create-store favorites
→ favoritesStore.ts 생성 (즐겨찾기 기능용)
```

---

#### [ ] `create-view`

새 페이지(View) 추가 시 필요한 파일들을 일관된 형태로 생성합니다.

생성되는 것:
- `frontend/src/views/<Name>View.vue` (`<script setup lang="ts">` + 레트로 테마 레이아웃)
- `router/index.ts`에 라우트 추가
- 네비게이션 링크 추가 위치 안내

사용 예:
```
/create-view Favorites
→ FavoritesView.vue 생성 + 라우터 등록
```

---

#### [ ] `create-component`

재사용 가능한 컴포넌트를 프로젝트 규칙대로 생성합니다.

생성되는 것:
- `frontend/src/components/<category>/<Name>.vue`
- `<script setup lang="ts">` + `defineProps` + `defineEmits` 타입 포함
- 레트로 테마 기본 레이아웃 포함

사용 예:
```
/create-component common/ConfirmDialog
```

---

## 분석 스킬 (analyze-*)

코드나 데이터를 읽고 인사이트를 제공합니다.

#### [ ] `analyze-menu-coverage`

현재 등록된 메뉴 데이터의 균형을 분석합니다.

분석 내용:
- 카테고리별 메뉴 수 분포 (`defaultMenus` 기준)
- emoji 중복 여부 탐지
- 메뉴가 적은 카테고리 강조 표시
- 추가 추천 메뉴 제안 (선택사항)

사용 예:
```
/analyze-menu-coverage
→ "한식 4개, 중식 3개 ... 분식이 3개로 가장 적음"
```

---

#### [ ] `analyze-history-patterns`

localStorage에 저장된 히스토리 데이터에서 패턴을 분석합니다.

분석 내용:
- 가장 많이 선택된 음식 Top 5
- 카테고리별 선택 빈도
- 최근 7일 기준 트렌드

사용 예:
```
/analyze-history-patterns
→ "최근 한식이 40% 선택됨, 삼겹살이 3번으로 1위"
```

---

#### [ ] `analyze-bundle-size`

Vite 빌드 결과물에서 번들 크기 이슈를 찾습니다.

분석 내용:
- `dist/` 폴더 청크 크기 확인
- 카카오맵 SDK 지연 로딩이 제대로 동작하는지 확인
- 큰 의존성 탐지 및 최적화 제안

---

## 진행 현황

| 스킬 | 유형 | 상태 | 비고 |
|------|------|------|------|
| `verify-stores` | 검증 | ⬜ 미시작 | Phase 1, 지금 바로 가능 |
| `verify-components` | 검증 | ⬜ 미시작 | Phase 1, 지금 바로 가능 |
| `verify-api` | 검증 | ⬜ 미시작 | Phase 1, 지금 바로 가능 |
| `verify-types` | 검증 | ⬜ 미시작 | Phase 1, 지금 바로 가능 |
| `verify-kakaomap` | 검증 | ⬜ 미시작 | Phase 2, 기능 완성 후 |
| `add-menu-category` | 자동화 | ⬜ 미시작 | 반복 작업 생기면 |
| `add-food-item` | 자동화 | ⬜ 미시작 | 반복 작업 생기면 |
| `reset-history` | 자동화 | ⬜ 미시작 | 개발 편의용 |
| `create-store` | 생성 | ⬜ 미시작 | store 추가 시 |
| `create-view` | 생성 | ⬜ 미시작 | 페이지 추가 시 |
| `create-component` | 생성 | ⬜ 미시작 | 컴포넌트 추가 시 |
| `analyze-menu-coverage` | 분석 | ⬜ 미시작 | 메뉴 데이터 정비 시 |
| `analyze-history-patterns` | 분석 | ⬜ 미시작 | 히스토리 기능 완성 후 |
| `analyze-bundle-size` | 분석 | ⬜ 미시작 | 배포 최적화 시 |
