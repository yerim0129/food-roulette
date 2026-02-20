# Food Roulette — Skills 가이드

이 프로젝트는 Claude Code의 커스텀 스킬 시스템을 활용해 코드 품질 검증, 리팩토링, 기능 확장을 일관된 방식으로 수행합니다.

> 프로젝트 전반적인 내용(기술 스택, 구조, API, 디자인 가이드)은 [CLAUDE.md](../../CLAUDE.md)를 참조하세요.

---

## Skills란?

`.claude/skills/` 폴더에 정의된 마크다운 파일로, Claude Code에게 특정 작업을 어떻게 수행할지 지시하는 레시피입니다.

```
.claude/skills/
├── manage-skills/
│   └── SKILL.md          # 스킬 생성 · 업데이트 · 관리
└── verify-implementation/
    └── SKILL.md          # 등록된 모든 verify 스킬을 순차 실행
```

스킬은 두 가지 종류로 나뉩니다:

| 종류 | 예시 | 역할 |
|------|------|------|
| **메타 스킬** | `manage-skills`, `verify-implementation` | 다른 스킬을 관리하거나 실행하는 조율자 |
| **검증 스킬** | `verify-stores`, `verify-api` (예시) | 특정 규칙·패턴을 코드에서 검사 |

---

## 현재 등록된 스킬

| 스킬 | 종류 | 설명 |
|------|------|------|
| `verify-implementation` | 메타 | 등록된 모든 verify 스킬을 순차 실행해 통합 보고서 생성 |
| `manage-skills` | 메타 | 세션 변경사항을 분석해 스킬 누락을 탐지하고 생성·업데이트 |

> 현재 `verify-*` 검증 스킬은 등록되어 있지 않습니다. `/manage-skills`로 생성할 수 있습니다.

---

## 기본 사용법

### 코드 변경 후 검증

```
/verify-implementation
```

등록된 모든 `verify-*` 스킬을 순서대로 실행하고 통합 보고서를 출력합니다.
이슈 발견 시 전체 자동 수정 / 개별 수정 / 건너뛰기를 선택할 수 있습니다.

특정 스킬만 실행하려면:

```
/verify-implementation verify-stores
```

---

### 스킬 유지보수

```
/manage-skills
```

현재 세션의 git 변경사항을 분석해 기존 스킬의 커버리지 갭을 찾고, 새 스킬이 필요한지 판단합니다.

특정 영역에 집중하려면:

```
/manage-skills stores
```

실행하면 다음 순서로 동작합니다:

1. `git diff`로 변경 파일 수집
2. 각 파일이 어떤 스킬과 매핑되는지 확인
3. 커버리지 갭 분석 (누락된 파일, 오래된 패턴, 새 규칙)
4. CREATE / UPDATE / 면제 결정을 제시하고 사용자 확인
5. 스킬 생성 또는 업데이트 후 관련 파일 자동 동기화

---

## 두 메타 스킬의 정확한 역할

### `verify-implementation` — 실행자

> "지금 코드가 프로젝트 규칙을 지키고 있나?"

등록된 `verify-*` 스킬들을 순서대로 돌려서 결과를 한 번에 보여줍니다.
**비유:** CI/CD 파이프라인. 버튼 하나로 전체 검사 실행.

```
지금은 등록된 verify-* 스킬이 0개라서
/verify-implementation 실행 → "스킬 없음, /manage-skills 실행하세요" 안내 후 종료
```

### `manage-skills` — 관리자

> "스킬이 코드베이스 현실과 맞게 관리되고 있나?"

`git diff`로 변경된 파일을 분석해 새 스킬이 필요한지, 기존 스킬이 낡았는지 찾아줍니다.
스킬을 만들거나 업데이트한 뒤 아래 3곳을 자동 동기화합니다.
**비유:** 스킬 시스템 전체를 관리하는 총무.

### 실제 사용 흐름

```
현재 상태: verify-* 스킬이 하나도 없음
                ↓
1. /manage-skills 실행
   → git diff 분석 → "verify-stores 만들겠습니까?" 제안
   → 승인 → verify-stores/SKILL.md 생성 + 3곳 자동 동기화
     (manage-skills/SKILL.md, verify-implementation/SKILL.md, CLAUDE.md)
                ↓
2. 이후 코드 수정 시
   → /verify-implementation 실행
   → verify-stores 검사 → 보고서 출력 → 이슈 수정 제안
                ↓
3. 새 파일/패턴 추가할 때마다
   → /manage-skills 로 스킬 최신화
```

**한 줄 요약:**
- `/manage-skills` = 스킬을 만들고 관리
- `/verify-implementation` = 만들어진 스킬로 코드를 검사

---

## 새 verify 스킬 추가하기

새로운 패턴이나 규칙을 적용하고 싶다면 스킬을 직접 추가할 수 있습니다.

**방법 1 — `/manage-skills`로 자동 생성 (권장)**

코드를 변경한 후 `/manage-skills`를 실행하면, Claude가 변경 내용을 분석하고 스킬 생성을 제안합니다.

**방법 2 — 직접 요청**

```
이 프로젝트의 Pinia store 작성 규칙을 검증하는 스킬을 만들어줘
```

Claude가 아래 구조로 스킬 파일을 생성하고, 관련 파일들을 자동 업데이트합니다.

**스킬 파일 구조 (`.claude/skills/verify-<name>/SKILL.md`)**

```markdown
---
name: verify-<name>
description: 한 줄 설명. 언제 실행할지 포함.
---

## Purpose
검증할 항목 목록 (2~5개)

## When to Run
실행 시점 (3~5개)

## Related Files
| File | Purpose |
|------|---------|
| `frontend/src/stores/menuStore.ts` | 검사 대상 파일 |

## Workflow
### Step 1: 규칙 이름
파일, 검사 명령어, PASS/FAIL 기준, 수정 방법

## Exceptions
false positive가 될 수 있는 케이스 (2~3개)
```

스킬 생성 후 `/manage-skills`가 아래 3곳을 자동 동기화합니다:

- `manage-skills/SKILL.md` — 등록된 검증 스킬 테이블
- `verify-implementation/SKILL.md` — 실행 대상 스킬 테이블
- `CLAUDE.md` — Skills 섹션

---

## 이 프로젝트에서 만들면 좋은 스킬

만들 예정이거나 아이디어 단계인 스킬 목록은 [SKILLS_ROADMAP.md](SKILLS_ROADMAP.md)에서 관리합니다.
Phase 1 / Phase 2로 우선순위가 나뉘어 있고, 완료 시 체크박스로 진행 현황을 추적합니다.

스킬을 만들 준비가 되면:

```
/manage-skills
```

---

## 스킬 시스템 확장 방향

현재 스킬 시스템을 더 발전시킬 수 있는 방향들입니다.

### 검증 스킬 확장

코드베이스 규칙이 생길 때마다 `verify-*` 스킬로 명문화하면, Claude가 매번 코드를 검토할 때 동일한 기준을 일관되게 적용합니다.

### 자동화 스킬

검증 외에도 반복 작업을 자동화하는 스킬을 추가할 수 있습니다:

```
.claude/skills/
├── generate-menu-seed/    # DB 시드 데이터 생성
├── add-category/          # 새 카테고리 추가 플로우
└── migrate-schema/        # Prisma 스키마 변경 가이드
```

### 워크플로우 스킬

여러 스킬을 순서대로 조합하는 고수준 스킬도 만들 수 있습니다:

```
/feature-complete   # verify → lint → build → 커밋 메시지 생성
```

---

## 자주 쓰는 명령어

```bash
# 스킬 실행
/verify-implementation          # 전체 검증
/manage-skills                  # 스킬 유지보수

# 개발
cd frontend && yarn dev         # 프론트엔드 개발 서버
cd backend && yarn dev          # 백엔드 개발 서버
cd backend && yarn db:studio    # Prisma Studio (DB 시각화)
```
