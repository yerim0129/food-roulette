# AI 추천 기능 설정 가이드

## 개요

룰렛 결과에 AI가 생성한 재미있는 추천 멘트를 표시하는 기능입니다.

**사용 API**: Google Gemini 1.5 Flash (무료)

---

## 설정 방법

### 1. Google AI Studio에서 API 키 발급

1. [Google AI Studio](https://aistudio.google.com) 접속
2. Google 계정으로 로그인
3. 좌측 메뉴에서 "Get API key" 클릭
4. "Create API key" 버튼 클릭
5. 생성된 API 키 복사

### 2. Vercel 환경변수 설정

1. [Vercel Dashboard](https://vercel.com) 접속
2. 프로젝트 선택
3. Settings → Environment Variables
4. 새 변수 추가:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: (복사한 API 키)
   - **Environment**: Production, Preview, Development 모두 체크

### 3. 재배포

환경변수 설정 후 자동으로 재배포되거나, Deployments 탭에서 수동 재배포

---

## 동작 방식

```
[사용자] 룰렛 스핀
    ↓
[RouletteWheel] 결과 결정 → spinEnd 이벤트
    ↓
[HomeView] handleSpinEnd() 호출
    ↓
[Frontend] POST /api/recommend { foodName, category }
    ↓
[Vercel Serverless] Gemini API 호출
    ↓
[Gemini] AI 멘트 생성
    ↓
[Frontend] 결과 모달에 AI 멘트 표시
```

---

## API 엔드포인트

### POST /api/recommend

**Request:**
```json
{
  "foodName": "김치찌개",
  "category": "한식"
}
```

**Response:**
```json
{
  "message": "추운 날씨에 딱! 뜨끈한 국물로 몸도 마음도 따뜻하게 🔥",
  "isAI": true
}
```

**Fallback (API 키 없거나 에러 시):**
```json
{
  "message": "오늘의 선택 김치찌개! 맛있게 드세요 😋",
  "isAI": false
}
```

---

## 비용

| 항목 | 내용 |
|-----|------|
| Gemini API | **무료** (60 요청/분, 무제한/월) |
| Vercel Serverless | **무료** (100GB-Hours/월) |

일반적인 개인 사용 수준에서는 **완전 무료**입니다.

---

## 로컬 테스트

1. 프로젝트 루트에 `.env` 파일 생성:
```
GEMINI_API_KEY=your_api_key_here
```

2. Vercel CLI 설치:
```bash
npm i -g vercel
```

3. 로컬 서버 실행:
```bash
vercel dev
```

---

## 문제 해결

### AI 멘트가 기본 메시지만 나옴

- Vercel 환경변수 `GEMINI_API_KEY` 설정 확인
- API 키 유효성 확인 (Google AI Studio에서 테스트)
- Vercel 로그 확인 (Functions 탭)

### 504 Timeout 에러

- Gemini API 응답 지연 시 발생 가능
- 자동으로 기본 메시지로 fallback됨

---

## 파일 구조

```
foodRoulette/
├── api/
│   └── recommend.ts          # Vercel Serverless Function
├── frontend/src/views/
│   └── HomeView.vue          # AI 멘트 표시 UI
└── vercel.json               # Vercel 설정
```
