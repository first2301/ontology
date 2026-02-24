Agent Skills — Manufacturing Ontology System

본 문서는 AI 에이전트(Cursor AI 등)가 프로젝트 목표 달성을 위해 활용해야 하는 기능적 도구(Tools)와 기술적 수행 능력(Skills)을 명세합니다. 에이전트는 코드 편집기 내에서 아래의 스킬들을 적절히 조합하여 문제를 해결해야 합니다.

1. Graph & Ontology Retrieval (그래프/온톨로지 구조 탐색 스킬)

목적: 시스템의 핵심인 제조 온톨로지 관계망을 정확히 파악하여 오작동 및 데이터 오염 방지.

활용 방법:

백엔드(Neo4j) 쿼리 로직이나 프론트엔드의 매칭 로직을 수정하기 전, 코드베이스 내에 정의된 MES_ONTOLOGY 데이터나 Neo4j의 스키마 명세를 먼저 읽고 분석합니다.

임의의 노드(Equipment, Sensor, WorkOrder 등)나 관계(Predicate)를 창작하지 않고, 표준 명세에 존재하는 구조만을 활용하여 Cypher 쿼리 및 매칭 알고리즘을 작성합니다.

2. API Schema Sync (풀스택 타입 동기화 스킬)

목적: 프론트엔드와 백엔드 간의 데이터 타입 불일치 및 통신 에러 방지.

활용 방법:

백엔드의 app/backend/models/schemas.py에 정의된 Pydantic 모델이 변경되거나 새로운 라우터가 추가될 경우, 이 스킬을 발동합니다.

에이전트는 즉시 프론트엔드의 app/ontology-platform/types.ts 및 app/ontology-platform/services/backendApi.ts 파일을 분석하여 TypeScript 인터페이스와 API 호출부를 백엔드 스펙에 맞게 자동으로 업데이트합니다.

3. Local Log Analysis (로컬 런타임 로그 분석 스킬)

목적: 컨테이너(Docker)가 없는 환경에서 발생하는 오류의 신속하고 정확한 디버깅.

활용 방법:

트러블슈팅 시 Docker 관련 명령어(docker logs 등)를 제안하지 않습니다.

파이썬 백엔드는 uvicorn 실행 터미널의 Traceback을, 프론트엔드는 Vite 실행 터미널 로그 및 브라우저 개발자 도구(Console/Network)의 응답 결과를 입력받아 분석합니다.

패키지 버전 충돌이 의심될 경우, app/backend/requirements.txt 또는 app/ontology-platform/package.json의 버전 정합성을 대조합니다.

4. SHACL Validation Workflow (온톨로지 정합성 검증 스킬)

목적: 그래프 데이터의 무결성 및 구조적 안전성 확보.

활용 방법:

데이터 적재(Data Loading) 또는 RDF/TTL 생성 로직을 작성할 때, pyshacl 라이브러리를 활용한 검증(Validation) 파이프라인이 정상적으로 동작하도록 코드를 구성합니다.

규칙에 어긋나는 노드 연결이나 필수 속성이 누락된 데이터가 Neo4j에 저장되지 않도록 방어적인 에러 핸들링 코드를 구축합니다.

5. UI/UX Safe Refactoring (비파괴적 시각화 리팩토링 스킬)

목적: 기존 데이터 시각화의 일관된 사용자 경험(UX) 유지 및 렌더링 성능 최적화.

활용 방법:

OntologyVisualizer.tsx (Cytoscape.js) 또는 대시보드 차트(Recharts) 관련 컴포넌트를 수정할 때 발동합니다.

무리하게 새로운 외부 라이브러리를 도입하지 않고, 기존에 설정된 Tailwind CSS 및 Radix UI 기반의 디자인 토큰(색상, 여백, 타이포그래피)을 유지합니다.

컴포넌트 리렌더링 최적화(useMemo, useCallback 등)를 통해 대규모 노드/엣지 렌더링 시 성능 저하를 방지합니다.