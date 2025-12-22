# Food Roulette - 프로젝트 현황 및 다음 단계

## 1. 변경 요약

### 삭제된 파일/코드
| 파일 | 이유 |
|-----|------|
| `frontend/src/components/layout/RetroHeader.vue` | 미사용 컴포넌트 |
| `frontend/src/components/common/RetroCard.vue` | 미사용 컴포넌트 |
| `frontend/src/components/layout/` 폴더 | 빈 폴더 |
| RetroButton.vue TODO 주석 | 불필요한 주석 |
| roulette.ts 중복 카테고리 데이터 | menuStore로 통합 |
| menus.ts/history.ts 중복 검증 함수 | validation.ts로 통합 |
| store 중복 localStorage 로직 | storage.ts로 통합 |

### 통합/리팩토링된 항목

#### Backend
| 항목 | Before | After |
|-----|--------|-------|
| 검증 함수 | menus.ts, history.ts 각각 정의 | `utils/validation.ts` 통합 |
| 길이 제한 상수 | 각 라우트 파일에 분산 | `validation.ts`에 중앙화 |

#### Frontend
| 항목 | Before | After |
|-----|--------|-------|
| localStorage 로직 | historyStore, menuStore 각각 구현 | `utils/storage.ts` 통합 |
| 카테고리 데이터 | roulette.ts, menuStore.ts 중복 | menuStore.ts 단일 소스 |
| HistoryItem 타입 | historyStore.ts에 정의 | `types/index.ts`로 이동 |

### 개선된 성능/보안 지표

| 항목 | 개선 내용 |
|-----|----------|
| DB 쿼리 | Menu.categoryId, Menu.createdAt, History.createdAt 인덱스 추가 |
| 입력 검증 | 모든 API에 양의 정수 검증 추가 |
| 길이 제한 | name(50), emoji(4), description(200), url(500), history limit(100) |
| CORS | 환경변수화 (CORS_ORIGINS) |
| 에러 로깅 | 환경별 분리 (개발/프로덕션) |
| deep watch | `menus.length`만 감시하도록 최적화 |

---

## 2. 현재 프로젝트 상태

### 완성된 기능

#### 핵심 기능
- [x] 홈 화면 (레트로 아케이드 테마)
- [x] 음식 룰렛 (카테고리 필터, 스핀 애니메이션)
- [x] 히스토리 (선택 기록 조회/삭제)
- [x] 메뉴 관리 (CRUD)
- [x] 주변 맛집 검색 (카카오맵 연동)

#### 인프라/품질
- [x] TypeScript strict 모드
- [x] Vue 3 Composition API
- [x] Pinia 상태 관리
- [x] Prisma ORM + SQLite
- [x] 입력값 유효성 검증
- [x] 에러 바운더리 컴포넌트
- [x] DB 인덱스 최적화
- [x] .gitignore 설정

### 진행 중인 기능
- 없음 (현재 안정화 단계)

### 남은 TODO 목록

#### Medium 우선순위
- [ ] API 캐싱 도입 (Redis/in-memory)
- [ ] Prisma 에러 타입별 처리
- [ ] RetroModal ESC 핸들러 최적화
- [ ] NearbyRestaurants 동적 로드
- [ ] 폰트 로딩 최적화 (preload)

#### Low 우선순위
- [ ] 캔버스 DPR 대응
- [ ] Vite 프록시 환경변수화
- [ ] retro.css 중복 제거
- [ ] 카카오맵 API 백엔드 래퍼 (API 키 보호)

---

## 3. 다음 단계 권장사항

### Phase 1: 안정화 (권장)

#### 1-1. 테스트 추가
```
우선순위: 높음
예상 작업량: 중간

- Backend API 단위 테스트 (Jest/Vitest)
- Frontend 컴포넌트 테스트 (Vue Test Utils)
- E2E 테스트 (Playwright/Cypress)
```

#### 1-2. 에러 처리 강화
```
우선순위: 중간
예상 작업량: 작음

- Prisma 에러 타입별 처리 (P2002, P2025 등)
- 프론트엔드 API 에러 핸들링 통합
```

### Phase 2: 사용자 경험 개선

#### 2-1. 성능 최적화
```
우선순위: 중간

- 폰트 preload 설정
- NearbyRestaurants 컴포넌트 lazy loading
- API 응답 캐싱 (stale-while-revalidate)
```

#### 2-2. 접근성 개선
```
우선순위: 낮음

- 키보드 네비게이션
- 스크린 리더 지원
- 색상 대비 개선
```

### Phase 3: 새 기능 개발

#### 3-1. 커스텀 음식 추가 기능
```
CLAUDE.md 향후 계획 중 가장 기본적인 기능

구현 내용:
- 메뉴 추가 폼 UI
- 이미지 업로드 (선택)
- 카테고리 선택
```

#### 3-2. PWA 지원
```
오프라인 사용 및 앱 설치 지원

구현 내용:
- Service Worker 설정
- Web App Manifest
- 오프라인 캐시 전략
```

#### 3-3. 음식 평점/리뷰
```
사용자 피드백 수집

구현 내용:
- 별점 UI 컴포넌트
- 리뷰 작성 폼
- 평점 기반 정렬
```

---

## 4. 기술 부채 목록

| 항목 | 심각도 | 설명 |
|-----|-------|------|
| 테스트 부재 | 높음 | 단위 테스트, E2E 테스트 없음 |
| API 문서화 | 중간 | Swagger/OpenAPI 스펙 없음 |
| 로깅 시스템 | 중간 | 구조화된 로깅 없음 (console.log 사용) |
| 카카오맵 API 키 | 낮음 | 프론트엔드에 노출 (백엔드 래퍼 권장) |
| 번들 분석 | 낮음 | 번들 크기 최적화 여지 있음 |

---

## 5. 권장 개발 순서

```
1. [안정화] 테스트 코드 작성
   └─ Backend API 테스트
   └─ Frontend 컴포넌트 테스트

2. [품질] 에러 처리 강화
   └─ Prisma 에러 타입별 처리
   └─ API 에러 핸들링 통합

3. [UX] 성능 최적화
   └─ 폰트 preload
   └─ 컴포넌트 lazy loading

4. [기능] 커스텀 음식 추가
   └─ 메뉴 추가 폼
   └─ 이미지 업로드

5. [기능] PWA 지원
   └─ Service Worker
   └─ 오프라인 캐시
```

---

## 6. 파일 구조 현황

```
frontend/src/
├── components/
│   ├── common/          # 공통 컴포넌트
│   │   ├── ErrorBoundary.vue
│   │   ├── RetroButton.vue
│   │   └── RetroModal.vue
│   ├── map/             # 지도 관련
│   │   ├── MapModal.vue
│   │   ├── NearbyRestaurants.vue
│   │   └── PlaceCard.vue
│   ├── menu/            # 메뉴 관련
│   │   ├── MenuCard.vue
│   │   └── MenuForm.vue
│   └── roulette/        # 룰렛 관련
│       └── RouletteWheel.vue
├── composables/
│   └── useKakaoMap.ts
├── stores/
│   ├── historyStore.ts
│   ├── menuStore.ts
│   └── roulette.ts
├── types/
│   ├── index.ts         # Food, Category, HistoryItem
│   └── map.ts           # 카카오맵 타입
├── utils/
│   └── storage.ts       # localStorage 유틸
└── views/
    ├── HomeView.vue
    ├── RouletteView.vue
    ├── HistoryView.vue
    └── MenuView.vue

backend/src/
├── routes/
│   ├── categories.ts
│   ├── history.ts
│   └── menus.ts
├── utils/
│   └── validation.ts    # 검증 유틸
├── lib/
│   └── prisma.ts
└── index.ts
```

---

*최종 업데이트: 2025-12-22*
