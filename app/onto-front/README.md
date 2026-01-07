# Manufacturing Ontology Frontend

제조 산업데이터 온톨로지 시스템의 Next.js 기반 프론트엔드 애플리케이션입니다.

## 🚀 기술 스택

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 4.5.0
- **Data Fetching**: React Query (@tanstack/react-query) 5.0.0
- **Graph Visualization**: Cytoscape.js 3.28.0
- **Charts**: Chart.js 4.4.0, react-chartjs-2 5.2.0
- **Icons**: Lucide React 0.400.0

## 📁 프로젝트 구조

```
app/onto-front/
├── app/                    # Next.js App Router 페이지
│   ├── graph/             # Graph View 페이지
│   ├── dashboard/         # Dashboard 페이지
│   ├── data-manager/      # Data Manager 페이지
│   ├── relationship/      # Relationship Editor 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈 페이지 (Graph로 리다이렉트)
│
├── src/
│   ├── components/        # React 컴포넌트
│   │   ├── common/        # 공통 컴포넌트 (Button, Loading, Toast, ErrorDisplay, Skeleton)
│   │   ├── dashboard/     # Dashboard 컴포넌트 (KPICard, QualityChart, EquipmentChart)
│   │   ├── data-manager/  # Data Manager 컴포넌트 (FileUpload, UploadHistory)
│   │   ├── graph/         # Graph 컴포넌트 (CytoscapeGraph, GraphControls, NodeDetailsPanel)
│   │   ├── layout/        # 레이아웃 컴포넌트 (Navbar, Sidebar, MainLayout)
│   │   ├── relationship/  # Relationship 컴포넌트 (TripleForm, TripleTable)
│   │   └── providers/    # Provider 컴포넌트 (QueryProvider)
│   │
│   ├── lib/
│   │   ├── api/           # API 클라이언트
│   │   │   ├── client.ts  # HTTP 클라이언트 (ApiError 포함)
│   │   │   ├── ontology.ts      # 온톨로지 API
│   │   │   ├── manufacturing.ts # 제조 데이터 API
│   │   │   └── analytics.ts     # 분석 API
│   │   ├── hooks/         # 커스텀 훅
│   │   │   ├── useCytoscape.ts  # Cytoscape 그래프 훅
│   │   │   ├── useDashboard.ts  # Dashboard 데이터 훅
│   │   │   ├── useToast.ts      # Toast 알림 훅
│   │   │   └── useAutoRefresh.ts # 자동 새로고침 훅
│   │   ├── stores/        # Zustand 스토어
│   │   │   └── graphStore.ts    # 그래프 상태 관리
│   │   └── utils/         # 유틸리티 함수
│   │       ├── constants.ts    # 상수 정의
│   │       └── transformers.ts  # 데이터 변환 함수
│   │
│   └── types/             # TypeScript 타입 정의
│       ├── api.ts         # API 타입
│       ├── graph.ts       # 그래프 타입
│       └── manufacturing.ts # 제조 데이터 타입
│
├── public/                # 정적 파일
├── next.config.ts         # Next.js 설정
├── tsconfig.json          # TypeScript 설정
└── package.json           # 의존성 관리
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
cd app/onto-front
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_API_BASE=/api
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 📄 주요 기능

### Graph View (`/graph`)
- Cytoscape.js 기반 인터랙티브 그래프 시각화
- 다중 레이아웃 지원 (Force-directed, Grid, Hierarchical, Circle)
- 노드/엣지 필터링 및 검색
- 노드 클릭 시 상세 정보 표시
- 그래프 요소 제한 설정

### Dashboard (`/dashboard`)
- KPI 카드 (Equipment Efficiency, Quality Rate, Active Orders, Production Trend)
- 품질 트렌드 차트 (Line Chart)
- 설비 상태 차트 (Doughnut Chart)
- 자동 새로고침 기능 (30초 간격)

### Data Manager (`/data-manager`)
- 파일 업로드 (드래그 앤 드롭 지원)
- TTL, OWL, RDF 파일 지원
- SHACL 검증 및 자동 로딩
- 업로드 히스토리 관리
- 업로드 후 Graph 자동 새로고침

### Relationship Editor (`/relationship`)
- 관계(Triple) 추가/삭제
- 관계 목록 테이블 표시
- 실시간 검증 및 피드백

## 🔧 주요 컴포넌트

### 공통 컴포넌트
- `Button`: 다양한 variant와 size를 지원하는 버튼
- `Loading`: 전체 화면 또는 인라인 로딩 스피너
- `Toast`: 알림 메시지 표시
- `ErrorDisplay`: 에러 메시지 및 재시도 기능
- `Skeleton`: 로딩 중 스켈레톤 UI

### API 클라이언트
- `HttpClient`: HTTP 요청 처리 및 에러 처리
- `ApiError`: 상세한 에러 정보를 포함하는 커스텀 에러 클래스
- 자동 재시도 및 에러 응답 파싱

### 상태 관리
- `graphStore`: 그래프 상태 (선택된 노드, 필터, 레이아웃 등)
- React Query: 서버 상태 관리 및 캐싱

## 🎨 스타일링

- **Tailwind CSS 4** 사용
- 반응형 디자인 지원
- 접근성 개선 (ARIA 레이블, 키보드 네비게이션)
- 포커스 상태 시각화

## 🔌 API 연동

백엔드 API는 `http://localhost:8001`에서 실행되어야 합니다.

### 주요 API 엔드포인트
- `GET /graph/elements` - 그래프 요소 조회
- `GET /ontology/triples` - 관계 조회
- `POST /ontology/triples` - 관계 추가
- `DELETE /ontology/triples` - 관계 삭제
- `POST /ontology/validate-and-import` - 파일 업로드 및 검증
- `GET /manufacturing/work-orders` - 작업지시서 조회
- `GET /analytics/quality-trend` - 품질 트렌드 조회

## 🐛 트러블슈팅

### 포트 충돌
포트 3000이 이미 사용 중인 경우:
```bash
# 다른 포트로 실행
npm run dev -- -p 3001
```

### API 연결 실패
- 백엔드 서버가 `http://localhost:8001`에서 실행 중인지 확인
- `.env.local` 파일의 `NEXT_PUBLIC_API_URL` 설정 확인
- CORS 설정 확인 (백엔드의 `main.py`에서 `localhost:3000` 허용)

### Cytoscape.js 에러
- 브라우저 콘솔에서 에러 확인
- 그래프 데이터가 올바르게 로드되었는지 확인

## 📝 개발 가이드

### 새로운 페이지 추가
1. `app/` 디렉토리에 새 폴더 생성
2. `page.tsx` 파일 생성
3. `MainLayout`으로 감싸기
4. 필요한 컴포넌트 및 훅 사용

### 새로운 API 엔드포인트 추가
1. `src/lib/api/` 디렉토리에 해당 모듈 파일 수정 또는 생성
2. `src/types/api.ts`에 타입 정의 추가
3. React Query의 `useQuery` 또는 `useMutation` 사용

### 스타일 커스터마이징
- `app/globals.css`에서 전역 스타일 수정
- Tailwind CSS 클래스 사용
- 컴포넌트별로 인라인 스타일 또는 CSS 모듈 사용 가능

## 📦 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```

### 정적 파일 생성 (선택사항)
```bash
npm run build
# .next 폴더에 빌드 결과물 생성
```

### Docker 배포 (선택사항)
프로젝트 루트의 `ontology-compose.yaml`을 사용하여 전체 스택 배포 가능

## 🔗 관련 문서

- [Next.js 문서](https://nextjs.org/docs)
- [React Query 문서](https://tanstack.com/query/latest)
- [Cytoscape.js 문서](https://js.cytoscape.org/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
