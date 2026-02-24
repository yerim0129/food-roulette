---
name: verify-stores
description: Pinia store 3개의 작성 규칙 준수 여부를 검사합니다. store 파일 추가/수정 후, PR 전, 코드 리뷰 시 사용.
---

# Pinia Store 규칙 검증

## Purpose

1. **Setup Store 형태** — `defineStore('name', () => { ... })` 형태 사용 확인
2. **localStorage 접근 규칙** — `localStorage` 직접 접근 금지, 반드시 `utils/storage.ts` 통해서만
3. **export 형태** — `export const use~Store` 형태로 export
4. **return문 완전성** — 모든 public 상태·액션이 return문에 명시
5. **store 간 참조 일관성** — `roulette.ts`처럼 내부에서 다른 store 호출 시 Setup Store 내부 호출 패턴 준수

## When to Run

- store 파일(`frontend/src/stores/*.ts`)을 추가하거나 수정한 후
- 새 store를 만들기 전에 기존 패턴 확인할 때
- PR 생성 전 코드 규칙 점검 시
- `/verify-implementation` 전체 검증 실행 시

## Related Files

| File | Purpose |
|------|---------|
| `frontend/src/stores/menuStore.ts` | 메뉴·카테고리 상태 관리, 기준 패턴 |
| `frontend/src/stores/historyStore.ts` | 히스토리 상태 관리 |
| `frontend/src/stores/roulette.ts` | 룰렛 상태 관리, store 간 참조 예시 |
| `frontend/src/utils/storage.ts` | localStorage 유틸 (직접 접근 대신 사용) |
| `frontend/src/types/index.ts` | Food, Category, HistoryItem 타입 정의 |

## Workflow

### Step 1: Setup Store 형태 확인

모든 store가 `defineStore('name', () => { ... })` Setup Store 형태를 사용하는지 확인합니다.
Options Store 형태(`defineStore('name', { state: ..., actions: ... })`)는 이 프로젝트에서 금지입니다.

**검사:**

```bash
grep -n "defineStore" frontend/src/stores/menuStore.ts frontend/src/stores/historyStore.ts frontend/src/stores/roulette.ts
```

**PASS 기준:** 모든 결과가 `defineStore('name', () => {` 형태
**FAIL 기준:** `defineStore('name', { state:` 또는 `defineStore('name', {` 형태 (Options Store)

**수정 방법:** Options Store를 Setup Store 형태로 변환
```typescript
// ❌ Options Store (금지)
export const useXxxStore = defineStore('xxx', {
  state: () => ({ count: 0 }),
  actions: { increment() { this.count++ } }
})

// ✅ Setup Store (올바른 형태)
export const useXxxStore = defineStore('xxx', () => {
  const count = ref(0)
  const increment = () => { count.value++ }
  return { count, increment }
})
```

---

### Step 2: localStorage 직접 접근 금지 확인

`localStorage`를 직접 접근하는 코드가 없는지 확인합니다.
반드시 `frontend/src/utils/storage.ts`의 `storage.get()`, `storage.set()`, `storage.remove()`를 통해서만 접근해야 합니다.

**검사:**

```bash
grep -n "localStorage" frontend/src/stores/menuStore.ts frontend/src/stores/historyStore.ts frontend/src/stores/roulette.ts
```

**PASS 기준:** 결과 없음 (직접 접근 없음)
**FAIL 기준:** `localStorage.getItem`, `localStorage.setItem`, `localStorage.removeItem` 등이 감지됨

**수정 방법:** `storage` 유틸로 교체
```typescript
// ❌ 직접 접근 (금지)
const stored = localStorage.getItem('key')
localStorage.setItem('key', JSON.stringify(value))

// ✅ storage 유틸 사용 (올바른 형태)
import { storage } from '@/utils/storage'
const stored = storage.get<Type>('key', fallback)
storage.set('key', value)
```

---

### Step 3: export 형태 확인

모든 store가 `export const use~Store` 형태로 export되는지 확인합니다.

**검사:**

```bash
grep -n "export const use" frontend/src/stores/menuStore.ts frontend/src/stores/historyStore.ts frontend/src/stores/roulette.ts
```

**PASS 기준:**
- `menuStore.ts` → `export const useMenuStore`
- `historyStore.ts` → `export const useHistoryStore`
- `roulette.ts` → `export const useRouletteStore`

**FAIL 기준:** `export default`, `module.exports`, 또는 `use` 접두사 없는 export

---

### Step 4: return문 완전성 확인

Setup Store에서 선언한 ref/computed/함수가 모두 return문에 포함되어 있는지 확인합니다.

**검사:** 각 store 파일을 Read 도구로 읽어 선언부와 return문을 대조합니다.

```bash
# menuStore.ts의 return문 확인
grep -A 20 "return {" frontend/src/stores/menuStore.ts
```

**PASS 기준:** store 내부에서 선언한 모든 `ref()`, `computed()`, 함수가 return문에 포함
**FAIL 기준:** 선언됐지만 return문에 없는 상태나 액션 존재

**주의:** 내부 헬퍼 함수(`saveToStorage`, `loadFromStorage` 등)는 외부에 노출할 필요 없으면 return에서 제외해도 됩니다.

---

### Step 5: store 간 참조 패턴 확인

다른 store를 참조할 때 Setup Store 내부에서 직접 호출하는 패턴을 확인합니다.
현재 `roulette.ts`가 내부에서 `useMenuStore()`를 호출하는 패턴을 기준으로 삼습니다.

**검사:**

```bash
grep -n "use.*Store()" frontend/src/stores/menuStore.ts frontend/src/stores/historyStore.ts frontend/src/stores/roulette.ts
```

**PASS 기준:** `roulette.ts`처럼 Setup Store 함수 본문 내에서 다른 store 호출 (`const menuStore = useMenuStore()`)
**FAIL 기준:** store 외부(모듈 최상위)에서 다른 store를 호출하거나, Pinia가 초기화되기 전에 store 접근

---

## Output Format

```markdown
## verify-stores 검증 결과

| 검사 항목 | 파일 | 상태 | 비고 |
|-----------|------|------|------|
| Setup Store 형태 | menuStore.ts | ✅ PASS | |
| Setup Store 형태 | historyStore.ts | ✅ PASS | |
| Setup Store 형태 | roulette.ts | ✅ PASS | |
| localStorage 직접 접근 | menuStore.ts | ✅ PASS | storage.ts 사용 확인 |
| localStorage 직접 접근 | historyStore.ts | ✅ PASS | storage.ts 사용 확인 |
| localStorage 직접 접근 | roulette.ts | ✅ PASS | storage 미사용 (불필요) |
| export 형태 | menuStore.ts | ✅ PASS | useMenuStore |
| export 형태 | historyStore.ts | ✅ PASS | useHistoryStore |
| export 형태 | roulette.ts | ✅ PASS | useRouletteStore |
| return문 완전성 | menuStore.ts | ✅ PASS | |
| return문 완전성 | historyStore.ts | ✅ PASS | |
| return문 완전성 | roulette.ts | ✅ PASS | |
| store 간 참조 패턴 | roulette.ts | ✅ PASS | menuStore 내부 호출 |

**총 이슈: 0개**
```

## Exceptions

다음은 **위반이 아닙니다**:

1. **`saveToStorage`, `loadFromStorage` return 미포함** — 내부 헬퍼 함수는 외부에 노출할 필요 없으므로 return에서 제외해도 정상
2. **`roulette.ts`의 `useMenuStore()` 내부 호출** — Setup Store 본문 안에서 다른 store를 호출하는 것은 Pinia 권장 패턴이며 허용
3. **`roulette.ts`에 localStorage 없음** — 룰렛 store는 상태를 localStorage에 저장하지 않으므로 `storage.ts` 미사용이 정상
