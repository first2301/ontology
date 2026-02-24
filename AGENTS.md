# Agent.md — Manufacturing Ontology System

AI 에이전트가 프로젝트를 이해하고 수정·추가 작업 시 참고할 가이드입니다.

---

## 1. 프로젝트 개요

- **이름**: Manufacturing Ontology System
- **설명**: 제조 산업데이터 온톨로지 기반 데이터 저장·관리·시각화·분석 통합 플랫폼
- **핵심 흐름**: 산업데이터 입력 → AutoML/모델링으로 필요 기능 도출 → 표준 MES 온톨로지와 매칭 → MES 기능 우선순위 제안 (Rule based)

---

## 2. 저장소 구조

| 경로 | 설명 |
|------|------|
| `app/backend/` | FastAPI 백엔드. Neo4j, 온톨로지/그래프/제조/분석/AutoML API |
| `app/onto-front/` | Next.js 프론트. 대시보드·데이터매니저·그래프·관계 편집. 백엔드와 연동 |
| `app/ontology-platform/` | React(Vite) 앱. AutoML + 온톨로지 매칭·MES 추천. 백엔드는 `backendApi.ts`로 `/automl/fit`만 연동 |
| `app/ontology/` | TTL 온톨로지 파일 (base, shapes, 샘플 등) |
| `docs/` | API 문서, 사용자 가이드 |
| `scripts/` | 샘플 데이터 생성 등 |

---

## 3. 기술 스택

- **Backend**: Python 3.x, FastAPI, Neo4j, rdflib, pyshacl, scikit-learn
- **onto-front**: Next.js, React, TypeScript
- **ontology-platform**: React, Vite, TypeScript, Recharts

---

## 4. 에이전트 작업 규칙

- 응답은 **한국어**로 작성
- 코드 생성 전 **계획·수정 대상 파일**을 먼저 제시하고, 확인 후 진행
- 생성한 코드는 **의존성 import** 검토 및 **함수/주요 로직 주석** 작성
- UI 변경 시 특정 요소가 과하게 강조되지 않도록 적용
- 질문/요청 **범위를 넘어서는 코드 생성 금지**

---

## 5. 연동 관계

- **onto-front ↔ backend**: API 클라이언트(`app/onto-front/src/lib/api/`)로 풀 연동
- **ontology-platform ↔ backend**: `VITE_API_URL` 설정 시 `POST /automl/fit`만 호출. 온톨로지·매칭은 로컬 상수·서비스 사용

---

## 6. 자주 사용하는 경로

- 백엔드 진입: `app/backend/main.py`
- 라우터: `app/backend/routers/` (ontology, graph, manufacturing, analytics, automl)
- AutoML 로직: `app/backend/services/automl.py`
- ontology-platform API 호출: `app/ontology-platform/services/backendApi.ts`
- 온톨로지 매칭: `app/ontology-platform/services/analysisService.ts`

---

## 7. 실행 요약

- **Backend**: `app/backend`에서 `uvicorn main:app --reload --port 8000`, `.env`에 Neo4j 등 설정
- **ontology-platform**: `VITE_API_URL` 설정 시 AutoML 단계에서 백엔드 호출
- 루트: `ontology-compose.yaml`로 서비스 구성

---

## 8. 디렉토리별 작업 범위 및 충돌 방지

- **한 번에 한 영역만 수정**: 요청이 특정 디렉토리(예: backend만, ontology-platform만)에 해당하면, 해당 경로만 변경하고 다른 앱 디렉토리는 건드리지 않는다. 연동 변경이 명시된 경우에만 두 곳을 동시에 수정한다.
- **backend (`app/backend/`)**: 라우터·서비스·스키마 변경 시, 해당 API를 호출하는 쪽을 확인한다.
  - `GET/POST /ontology/*`, `/graph/*`, `/manufacturing/*`, `/analytics/*` → **onto-front** (`app/onto-front/src/lib/api/`)
  - `POST /automl/fit` → **ontology-platform** (`app/ontology-platform/services/backendApi.ts`)
- **onto-front (`app/onto-front/`)**: 백엔드 API 스펙(경로·요청/응답 형식)을 바꿀 때는 backend와 함께 스펙을 정한 뒤, `app/onto-front`의 client·타입만 그에 맞춰 수정한다. ontology-platform은 건드리지 않는다.
- **ontology-platform (`app/ontology-platform/`)**: 백엔드 연동은 `backendApi.ts`와 `VITE_API_URL`뿐이다. AutoML 외 새 API를 붙일 때만 backend·ontology-platform 양쪽을 명시적으로 범위에 넣고, onto-front는 별도 요청이 없으면 수정하지 않는다.
- **공통**: 환경 변수(`.env`, `.env.local`), API base URL, 포트를 바꿀 때는 "어느 앱이 그 설정을 쓰는지"를 위 연동 관계를 보고 확인한 뒤, 필요한 앱만 변경한다.

---

## 9. 환경·의존성

- **Python**: 3.10 이상 권장. 백엔드 패키지는 `app/backend/requirements.txt`에만 추가한다.
- **Node**: 18 이상 권장. onto-front·ontology-platform 각각 `package.json`이 있으므로, 새 패키지는 해당 앱의 `package.json`에만 추가한다.
- **Backend 환경 변수** (`app/backend/.env`): `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASS`, (선택) `ONTOLOGY_DIR`
- **ontology-platform 환경 변수** (`.env.local` 등): (선택) `VITE_API_URL` — 설정 시 AutoML 단계에서 백엔드 호출

---

## 10. 테스트·검증

- 프로젝트에 전용 테스트 디렉토리/스크립트는 없음. 코드 수정 후에는 수동 실행·API 호출로 검증하는 것을 권장한다.
- 백엔드 API 확인: `uvicorn` 실행 후 `http://localhost:8000/docs`에서 스웨거 확인.

---

## 11. 보안·취급 주의

- `.env`, `.env.local` 등 비밀정보가 들어가는 파일은 버전 관리에 올리지 않는다. (각 앱 `.gitignore`에 포함되어 있어도, 예시 코드나 문서에 실제 비밀값을 넣지 않는다.)
- API 키·DB 비밀번호는 코드나 Agent.md에 하드코딩하지 않는다.

---

## 12. 레거시·비활성 디렉토리

- **`backup/`**: 과거 프론트/설정 백업용. 현재 개발 대상이 아니므로, 요청 없이 수정·리팩터링하지 않는다.

---

## 13. 네이밍·코드 스타일

- **주석·문서**: 한국어 사용 (사용자 규칙과 동일).
- **코드**: API 경로·필드명·변수명은 영어. 새 API 추가 시 일관된 스타일을 유지한다.

---

## 14. 하지 말 것

- **범위 밖 수정 금지**: 요청된 디렉토리/파일만 수정한다. "같이 고쳐두면 좋겠다"는 식으로 다른 앱·디렉토리를 임의로 건드리지 않는다.
- **API 스키마 단독 변경 금지**: backend API 응답·요청 스키마를 바꿀 때는, 그 API를 쓰는 프론트(onto-front 또는 ontology-platform)를 범위에 넣어 함께 수정하지 않으면, 응답 필드 삭제·이름 변경을 하지 않는다.
- **비밀정보 금지**: 예시·문서에 실제 비밀번호·API 키를 넣지 않는다.