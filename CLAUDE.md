# 🎰 Food Roulette - AI 개발 가이드

## 프로젝트 개요

"뭐 먹지?" 고민을 해결하는 음식 룰렛 웹 애플리케이션
레트로 아케이드 테마의 재미있는 UI로 오늘의 메뉴를 랜덤 선택!

---

## 기술 스택

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Styling**: Tailwind CSS (레트로 아케이드 테마)
- **Build Tool**: Vite
- **Package Manager**: Yarn

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: SQLite
- **Package Manager**: Yarn

---

## 프로젝트 구조

```
food-roulette/
├── frontend/                 # Vue 3 애플리케이션
│   ├── src/
│   │   ├── components/      # 재사용 컴포넌트
│   │   ├── views/           # 페이지 컴포넌트
│   │   ├── stores/          # Pinia 스토어
│   │   ├── composables/     # Vue Composables
│   │   ├── types/           # TypeScript 타입 정의
│   │   ├── router/          # Vue Router 설정
│   │   ├── assets/          # 정적 자원
│   │   ├── App.vue          # 루트 컴포넌트
│   │   ├── main.ts          # 엔트리 포인트
│   │   └── style.css        # 글로벌 스타일 (Tailwind)
│   ├── tailwind.config.js   # Tailwind 설정
│   ├── vite.config.ts       # Vite 설정
│   └── package.json
│
├── backend/                  # Express API 서버
│   ├── src/
│   │   ├── routes/          # API 라우트
│   │   ├── controllers/     # 컨트롤러
│   │   ├── services/        # 비즈니스 로직
│   │   ├── types/           # TypeScript 타입
│   │   ├── middleware/      # 미들웨어
│   │   └── index.ts         # 서버 엔트리
│   ├── prisma/
│   │   └── schema.prisma    # DB 스키마
│   ├── tsconfig.json
│   └── package.json
│
└── CLAUDE.md                 # 이 파일
```

---

## 개발 명령어

### Frontend
```bash
cd frontend
yarn install          # 의존성 설치
yarn dev              # 개발 서버 (http://localhost:5173)
yarn build            # 프로덕션 빌드
yarn preview          # 빌드 프리뷰
```

### Backend
```bash
cd backend
yarn install          # 의존성 설치
yarn dev              # 개발 서버 (http://localhost:3000)
yarn build            # TypeScript 컴파일
yarn start            # 프로덕션 실행
yarn db:push          # DB 스키마 푸시
yarn db:migrate       # DB 마이그레이션
yarn db:studio        # Prisma Studio
```

---

## 디자인 테마: 레트로 아케이드

### 컬러 팔레트
```
retro-black:  #0a0a0a   - 배경 (딥 블랙)
retro-dark:   #1a1a2e   - 메인 배경
retro-purple: #16213e   - 카드 배경
retro-blue:   #0f3460   - 보조 배경
retro-pink:   #e94560   - 강조색 (핫핑크)
retro-yellow: #ffc300   - 타이틀/슬롯
retro-green:  #00ff41   - 성공/Matrix
retro-cyan:   #00d4ff   - 네온 블루
retro-orange: #ff6b35   - 경고색
retro-cream:  #f5f0e1   - 텍스트
```

### 폰트
- **Press Start 2P**: 픽셀 폰트 (타이틀, 버튼)
- **VT323**: 아케이드 폰트 (본문)
- **Russo One**: 레트로 산스 (강조)

### CSS 클래스
- `.retro-title` - 네온 그림자 타이틀
- `.btn-neon` / `.btn-neon-cyan` / `.btn-neon-yellow` - 네온 버튼
- `.retro-box` - 레트로 박스
- `.slot-window` - 슬롯머신 창
- `.category-tag` - 카테고리 태그
- `.food-card` - 음식 카드
- `.text-neon-*` - 네온 텍스트 효과

### 애니메이션
- `animate-spin-slow` - 느린 회전
- `animate-pulse-neon` - 네온 펄스
- `animate-blink` - 깜빡임
- `animate-bounce-slow` - 느린 바운스
- `crt-effect` - CRT 모니터 효과

---

## 데이터 모델

### Category (카테고리)
```typescript
{
  id: number
  name: string      // "한식", "중식", "양식", "일식", "분식"
  emoji: string     // 🍚, 🥟, 🍝, 🍣, 🍢
}
```

### Food (음식)
```typescript
{
  id: number
  name: string
  emoji: string
  description?: string
  imageUrl?: string
  categoryId: number
}
```

### History (히스토리)
```typescript
{
  id: number
  foodId: number
  createdAt: Date
}
```

---

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/health` | 헬스 체크 |
| GET | `/api/categories` | 카테고리 목록 |
| GET | `/api/foods` | 음식 목록 |
| GET | `/api/foods/:categoryId` | 카테고리별 음식 |
| POST | `/api/history` | 히스토리 저장 |
| GET | `/api/history` | 히스토리 조회 |

---

## 주요 기능

1. **홈 화면**: 시작 화면, 애니메이션 효과
2. **룰렛 화면**:
   - 카테고리 필터 선택
   - 슬롯머신 스타일 룰렛
   - SPIN 버튼으로 랜덤 선택
3. **히스토리**: 이전 선택 기록 조회

---

## 개발 규칙

### 코딩 컨벤션
- Vue: `<script setup>` + Composition API 사용
- TypeScript: strict 모드
- 컴포넌트: PascalCase (예: `FoodCard.vue`)
- Composables: `use` 접두사 (예: `useRoulette.ts`)
- Store: 기능별 분리 (예: `roulette.ts`)

### 커밋 메시지
```
feat: 새 기능
fix: 버그 수정
style: UI/스타일 변경
refactor: 리팩토링
docs: 문서 수정
```

---

## 미리보기

```
┌─────────────────────────────────────┐
│  ★ FOOD ROULETTE ★                 │
│        뭐 먹지?                      │
├─────────────────────────────────────┤
│                                     │
│      ┌───────────────┐              │
│      │   🍕 피자    │              │
│      │     ↓        │              │
│      │  ◄ 🎰 ►     │              │
│      └───────────────┘              │
│                                     │
│       ▼ START ▼                    │
│                                     │
├─────────────────────────────────────┤
│ [한식] [중식] [양식] [일식] [분식]    │
└─────────────────────────────────────┘
```

---

## 환경 변수

### Backend (.env)
```
DATABASE_URL="file:./dev.db"
PORT=3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

---

## 향후 확장 계획

- [ ] 사용자 인증
- [ ] 커스텀 음식 추가
- [ ] 음식 평점/리뷰
- [ ] 맛집 추천 연동
- [ ] PWA 지원
- [ ] 다크/라이트 모드

--- 

## Skills

커스텀 검증 및 유지보수 스킬은 `.claude/skills/`에 정의되어 있습니다.

| Skill | Purpose |
|-------|---------|
| `verify-implementation` | 프로젝트의 모든 verify 스킬을 순차 실행하여 통합 검증 보고서를 생성합니다 |
| `manage-skills` | 세션 변경사항을 분석하고, 검증 스킬을 생성/업데이트하며, CLAUDE.md를 관리합니다 |
