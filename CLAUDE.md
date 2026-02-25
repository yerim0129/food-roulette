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

### Serverless (Vercel Functions)
- **Runtime**: Node.js
- **Language**: TypeScript
- **배포**: Vercel (`api/` 폴더 자동 인식)
- **로컬 테스트**: `vercel dev`

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
├── api/                      # Vercel Serverless Functions (백엔드 역할)
│   └── recommend.ts          # AI 추천 멘트 (Gemini 연동)
│
└── CLAUDE.md                 # 이 파일
```

---

## 개발 환경 세팅 (처음 또는 새 PC에서 시작할 때)

### 1. 필수 도구 설치 (최초 1회)

```bash
# Yarn 설치
npm install -g yarn

# Vercel CLI 설치
npm install -g vercel

# Vercel 로그인 (브라우저에서 인증)
vercel login
```

### 2. 의존성 설치

```bash
cd frontend
yarn install
```

### 3. 로컬 실행

```bash
cd frontend
yarn dev
# → http://localhost:5173 에서 확인
```

> AI 추천 멘트는 로컬에서 기본 메시지로 표시됩니다.
> 실제 AI 멘트는 Vercel 배포 환경에서 GEMINI_API_KEY 설정 후 확인 가능합니다.

### 4. 환경 변수 설정

`api/` 함수가 Gemini API를 사용하려면 환경변수가 필요합니다.

**로컬:** 프로젝트 루트에 `.env` 파일 생성
```
GEMINI_API_KEY=your_key_here
```

**배포(Vercel):** Vercel 대시보드 → 프로젝트 Settings → Environment Variables에서 설정

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

## Vercel Functions 엔드포인트

| Method | Endpoint | 파일 | 설명 |
|--------|----------|------|------|
| POST | `/api/recommend` | `api/recommend.ts` | AI 추천 멘트 (Gemini) |

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

### Vercel (환경변수 설정 필요)
```
GEMINI_API_KEY=your_key_here
```

### Frontend
로컬 개발 시 별도 환경변수 불필요.

---

## 향후 확장 계획

- [ ] 사용자 인증
- [ ] 커스텀 음식 추가
- [ ] 음식 평점/리뷰
- [ ] 맛집 추천 연동
- [ ] PWA 지원
- [ ] 다크/라이트 모드
