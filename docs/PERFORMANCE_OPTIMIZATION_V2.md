# 성능 최적화 2차 점검

## 개요
2차 성능 분석 결과 발견된 이슈들을 수정한 내역입니다.

---

## 체크리스트

### Critical (높음)
- [x] CORS 환경변수화
- [x] 입력값 길이 검증 추가 (name: 50자, emoji: 4자)
- [x] History limit 최대값 제한 (100)
- [x] Menu.createdAt 인덱스 추가
- [x] 환경별 에러 로깅 분리

### Medium (중간)
- [ ] API 캐싱 도입 (Redis/in-memory)
- [ ] Prisma 에러 타입별 처리
- [ ] RetroModal ESC 핸들러 최적화
- [ ] NearbyRestaurants 동적 로드
- [ ] 폰트 로딩 최적화 (preload)

### Low (낮음)
- [ ] 캔버스 DPR 대응
- [ ] 타입 정의 통합
- [ ] Vite 프록시 환경변수화
- [ ] retro.css 중복 제거
- [ ] 카카오맵 API 백엔드 래퍼

---

## 수정 상세 내역

### 1. CORS 환경변수화

**문제점**
- `index.ts`에 localhost 포트가 하드코딩됨
- 프로덕션 환경에서 배포 시 수정 필요

**해결**
환경변수 `CORS_ORIGINS`로 CORS 설정 관리

**Before:**
```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  // ...
}))
```

**After:**
```typescript
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173']

app.use(cors({
  origin: corsOrigins,
  // ...
}))
```

**수정 파일**
- `backend/src/index.ts`
- `backend/.env` - `CORS_ORIGINS` 추가

---

### 2. 입력값 길이 검증 추가

**문제점**
- 문자열 길이 제한 없이 무한 길이 허용
- DoS 공격 및 DB 저장 문제 가능

**해결**
메뉴 생성/수정 시 입력값 길이 검증

```typescript
// 길이 제한 상수
const MAX_NAME_LENGTH = 50
const MAX_EMOJI_LENGTH = 4
const MAX_DESCRIPTION_LENGTH = 200
const MAX_URL_LENGTH = 500

// 검증 로직
if (name.length > MAX_NAME_LENGTH) {
  return res.status(400).json({ error: `name must be ${MAX_NAME_LENGTH} characters or less` })
}
```

**수정 파일**
- `backend/src/routes/menus.ts`

---

### 3. History limit 최대값 제한

**문제점**
- limit 파라미터에 제한 없음
- 과도한 데이터 조회로 서버 부하 가능

**해결**
최대값 100으로 제한

**Before:**
```typescript
take: Number(limit)
```

**After:**
```typescript
const MAX_LIMIT = 100
take: Math.min(Number(limit), MAX_LIMIT)
```

**수정 파일**
- `backend/src/routes/history.ts`

---

### 4. Menu.createdAt 인덱스 추가

**문제점**
- `orderBy: { createdAt: 'desc' }` 쿼리에 인덱스 없음
- 데이터 증가 시 정렬 성능 저하

**해결**
Prisma 스키마에 인덱스 추가

```prisma
model Menu {
  // ... fields
  @@index([categoryId])
  @@index([createdAt])
}
```

**수정 파일**
- `backend/prisma/schema.prisma`

---

### 5. 환경별 에러 로깅 분리

**문제점**
- 프로덕션에서도 전체 스택 트레이스 로깅
- 민감 정보 노출 위험

**해결**
NODE_ENV에 따른 로깅 수준 분리

```typescript
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const isDev = process.env.NODE_ENV !== 'production'

  if (isDev) {
    console.error('Error:', err)
  } else {
    console.error('Error:', { message: err.message, path: req.path })
  }

  res.status(500).json({
    error: 'Internal Server Error',
    ...(isDev && { message: err.message })
  })
})
```

**수정 파일**
- `backend/src/index.ts`

---

## 요약

| 수정 항목 | 우선순위 | 상태 |
|----------|---------|------|
| CORS 환경변수화 | Critical | 완료 |
| 입력값 길이 검증 | Critical | 완료 |
| History limit 제한 | Critical | 완료 |
| Menu.createdAt 인덱스 | Critical | 완료 |
| 환경별 에러 로깅 | Critical | 완료 |
