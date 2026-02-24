---
name: verify-components
description: Vue 컴포넌트 13개의 작성 규칙 준수 여부를 검사합니다. 컴포넌트 추가/수정 후, PR 전, 코드 리뷰 시 사용.
---

# Vue 컴포넌트 규칙 검증

## Purpose

1. **script setup 형태** — `<script setup lang="ts">` 필수
2. **파일명 PascalCase** — 모든 .vue 파일이 PascalCase 형태
3. **Props/Emits 타입 선언** — 제네릭 인터페이스 기반 타입 선언 필수
4. **인라인 스타일 제한** — 동적 애니메이션 딜레이 외 정적 `style=""` 금지
5. **레트로 테마 클래스 사용** — 커스텀 CSS 클래스 활용 (`retro-*`, `btn-neon*`, `font-pixel` 등)

## When to Run

- `frontend/src/components/` 또는 `frontend/src/views/` 파일을 추가하거나 수정한 후
- 새 컴포넌트를 만들기 전에 기존 패턴 확인할 때
- PR 생성 전 코드 규칙 점검 시
- `/verify-implementation` 전체 검증 실행 시

## Related Files

| File | Purpose |
|------|---------|
| `frontend/src/components/common/ErrorBoundary.vue` | 공통 에러 바운더리 |
| `frontend/src/components/common/RetroButton.vue` | 공통 버튼 컴포넌트, Props/Emits 기준 패턴 |
| `frontend/src/components/common/RetroModal.vue` | 공통 모달 컴포넌트 |
| `frontend/src/components/map/MapModal.vue` | 지도 모달 |
| `frontend/src/components/map/NearbyRestaurants.vue` | 주변 음식점 목록 |
| `frontend/src/components/map/PlaceCard.vue` | 장소 카드 |
| `frontend/src/components/menu/MenuCard.vue` | 메뉴 카드 |
| `frontend/src/components/menu/MenuForm.vue` | 메뉴 폼 |
| `frontend/src/components/roulette/RouletteWheel.vue` | 룰렛 휠 (인라인 스타일 예외 파일) |
| `frontend/src/views/HistoryView.vue` | 히스토리 페이지 |
| `frontend/src/views/HomeView.vue` | 홈 페이지 |
| `frontend/src/views/MenuView.vue` | 메뉴 관리 페이지 |
| `frontend/src/views/RouletteView.vue` | 룰렛 페이지 |
| `frontend/src/style.css` | 글로벌 스타일 (레트로 테마 클래스 정의) |

## Workflow

### Step 1: script setup lang="ts" 확인

모든 .vue 파일이 `<script setup lang="ts">`를 사용하는지 확인합니다.

**검사:**

```bash
grep -rL 'script setup lang="ts"' frontend/src/components/ frontend/src/views/ --include="*.vue"
```

**PASS 기준:** 결과 없음 (모든 파일이 `<script setup lang="ts">` 사용)
**FAIL 기준:** 파일 목록이 출력됨 (누락된 파일 존재)

**수정 방법:**
```vue
<!-- ❌ 금지 -->
<script>
<script setup>
<script lang="ts">

<!-- ✅ 올바른 형태 -->
<script setup lang="ts">
```

---

### Step 2: 파일명 PascalCase 확인

컴포넌트 파일명이 모두 PascalCase인지 확인합니다.

**검사:**

```bash
find frontend/src/components frontend/src/views -name "*.vue" | grep -v "[A-Z]"
```

**PASS 기준:** 결과 없음
**FAIL 기준:** 소문자로 시작하는 파일명 출력 (예: `menuCard.vue`, `home.vue`)

**수정 방법:** 파일명 변경 (`menuCard.vue` → `MenuCard.vue`)

---

### Step 3: Props 타입 선언 확인

Props를 받는 컴포넌트가 제네릭 인터페이스 기반 타입 선언을 사용하는지 확인합니다.

**검사:**

```bash
grep -rn "defineProps" frontend/src/components/ frontend/src/views/ --include="*.vue"
```

**PASS 기준:** `defineProps<Props>()` 또는 `withDefaults(defineProps<Props>(), {...})` 형태
**FAIL 기준:** `defineProps({ prop: String })` 런타임 타입 선언 형태

**올바른 패턴 (RetroButton.vue 기준):**
```typescript
// ✅ 인터페이스 기반 (올바른 형태)
interface Props {
  variant?: 'neon' | 'cyan' | 'yellow'
  disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  variant: 'neon',
  disabled: false,
})

// ❌ 런타임 타입 선언 (금지)
const props = defineProps({
  variant: String,
  disabled: Boolean,
})
```

---

### Step 4: Emits 타입 선언 확인

Emits를 사용하는 컴포넌트가 제네릭 타입 선언을 사용하는지 확인합니다.

**검사:**

```bash
grep -rn "defineEmits" frontend/src/components/ frontend/src/views/ --include="*.vue"
```

**PASS 기준:** `defineEmits<{ eventName: [payload: Type] }>()` 형태
**FAIL 기준:** `defineEmits(['eventName'])` 문자열 배열 형태

**올바른 패턴:**
```typescript
// ✅ 제네릭 타입 선언 (올바른 형태)
const emit = defineEmits<{
  edit: [food: Food]
  delete: [id: number]
}>()

// ❌ 문자열 배열 (금지)
const emit = defineEmits(['edit', 'delete'])
```

---

### Step 5: 인라인 스타일 사용 확인

동적 애니메이션 딜레이 외에 정적 `style=""` 속성이 사용되는지 확인합니다.

**검사:**

```bash
grep -rn 'style="' frontend/src/components/ frontend/src/views/ --include="*.vue"
```

**PASS 기준:** 결과 없음 (정적 style 속성 없음)
**FAIL 기준:** `style="color: red"` 같은 정적 인라인 스타일 감지

**허용 예외 (동적 바인딩):**
```vue
<!-- ✅ 허용 — 동적 애니메이션 딜레이 (MapModal, NearbyRestaurants, PlaceCard, HomeView) -->
:style="{ animationDelay: `${index * 0.1}s` }"

<!-- ✅ 허용 — 룰렛 휠 캔버스 동적 스타일 (RouletteWheel.vue) -->
:style="{ boxShadow: '...', animation: '...' }"

<!-- ❌ 금지 — 정적 인라인 스타일 -->
style="color: red; font-size: 16px"
```

**수정 방법:** Tailwind 클래스 또는 레트로 테마 클래스로 교체

---

### Step 6: 레트로 테마 클래스 사용 확인

이 프로젝트의 커스텀 레트로 CSS 클래스가 활용되고 있는지 확인합니다.

**검사 — 핵심 클래스 사용 현황:**

```bash
grep -rn "retro-title\|retro-box\|btn-neon\|slot-window\|category-tag\|food-card\|font-pixel\|font-arcade" frontend/src/ --include="*.vue" | wc -l
```

**PASS 기준:** 10개 이상 (프로젝트 전반에 걸쳐 사용 중)
**FAIL 기준:** 5개 미만 (레트로 테마가 거의 사용되지 않음 — 새 컴포넌트에서 누락 의심)

**새 컴포넌트 추가 시 확인할 레트로 클래스 목록:**

| 클래스 | 용도 |
|--------|------|
| `retro-title` | 페이지 타이틀 |
| `retro-box` | 카드/패널 컨테이너 |
| `slot-window` | 슬롯머신 창 |
| `btn-neon` | 핑크 네온 버튼 |
| `btn-neon-cyan` | 시안 네온 버튼 |
| `btn-neon-yellow` | 옐로우 네온 버튼 |
| `category-tag` | 카테고리 필터 태그 |
| `food-card` | 음식 카드 |
| `font-pixel` | 픽셀 폰트 (Press Start 2P) |
| `font-arcade` | 아케이드 폰트 (VT323) |
| `font-korean` | 한글 폰트 |

---

## Output Format

```markdown
## verify-components 검증 결과

| 검사 항목 | 상태 | 이슈 |
|-----------|------|------|
| script setup lang="ts" | ✅ PASS | 13/13 파일 준수 |
| 파일명 PascalCase | ✅ PASS | 13/13 파일 준수 |
| Props 타입 선언 | ✅ PASS | 인터페이스 기반 사용 확인 |
| Emits 타입 선언 | ✅ PASS | 제네릭 타입 선언 사용 확인 |
| 인라인 스타일 | ✅ PASS | 정적 style 속성 없음 |
| 레트로 테마 클래스 | ✅ PASS | 전 파일 사용 확인 |

**총 이슈: 0개**
```

## Exceptions

다음은 **위반이 아닙니다**:

1. **RouletteWheel.vue의 광범위한 인라인 스타일** — 캔버스 기반 룰렛 휠 애니메이션은 JavaScript로 동적 계산이 필요해 `:style` 바인딩이 불가피함. CSS 클래스로 대체 불가능한 케이스
2. **MapModal.vue, NearbyRestaurants.vue, PlaceCard.vue, HomeView.vue의 `animationDelay`** — 리스트 아이템 순차 애니메이션을 위한 동적 딜레이는 `:style` 바인딩이 필요하며 허용
3. **Views의 Props/Emits 없음** — 페이지 컴포넌트(View)는 라우터가 직접 렌더링하므로 Props를 받지 않는 것이 정상
4. **ErrorBoundary.vue의 Props 없음** — 슬롯 기반 컴포넌트로 Props 없이 동작하는 것이 정상
