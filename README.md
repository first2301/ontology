# Manufacturing Ontology System

제조 산업데이터 온톨로지 시스템 - 제조 프로세스의 데이터를 체계적으로 저장, 관리, 시각화하는 통합 플랫폼입니다.

## 🚀 주요 기능

### 📊 온톨로지 기반 데이터 관리
- **제조 특화 클래스**: Equipment, Sensor, Variable, WorkOrder, QualityControl, Maintenance, Batch, Defect
- **관계 모델링**: 설비-센서, 작업지시서-설비, 제품-품질관리 등 복잡한 관계 표현
- **SHACL 검증**: 데이터 무결성 보장을 위한 자동 검증

### 🔧 실시간 모니터링
- **대시보드**: KPI 카드, 실시간 차트, 품질 트렌드 분석
- **설비 효율성**: OEE(Overall Equipment Effectiveness) 계산
- **알람 시스템**: 이상 상황 실시간 감지 및 알림

### 🎨 고급 시각화
- **인터랙티브 그래프**: Cytoscape.js 기반 온톨로지 관계 시각화
- **다중 레이아웃**: Force-directed, Grid, Hierarchical, Circle 레이아웃
- **필터링**: 노드 타입별, 관계별, 검색 기반 필터링

### 📝 관계 편집기
- **CRUD 작업**: 관계 추가, 수정, 삭제
- **벌크 작업**: 다중 관계 일괄 처리
- **히스토리 관리**: 실행 취소/다시 실행 기능

### 📁 데이터 관리
- **파일 업로드**: TTL, OWL, RDF 파일 지원
- **실시간 검증**: SHACL 기반 데이터 검증
- **내보내기**: JSON, CSV, 이미지 형식 지원

## 🏗️ 시스템 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Databases     │
│   (Nginx)       │◄──►│   (FastAPI)     │◄──►│   (Neo4j)       │
│   Port: 3001    │    │   Port: 8001    │    │   Port: 7474    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Visualization │    │   API Gateway    │    │   Time Series   │
│   (Cytoscape)   │    │   (REST/GraphQL)│    │   (InfluxDB)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Monitoring    │    │   Analytics     │
                       │   (Grafana)     │    │   (Custom)      │
                       │   Port: 3003    │    └─────────────────┘
                       └─────────────────┘
```

## 🛠️ 기술 스택

### Backend
- **FastAPI**: 고성능 Python 웹 프레임워크
- **Neo4j**: 그래프 데이터베이스 (온톨로지 저장)
- **InfluxDB**: 시계열 데이터베이스 (센서 데이터)
- **n10s**: Neo4j RDF 플러그인

### Frontend
- **Alpine.js**: 경량 JavaScript 프레임워크
- **Cytoscape.js**: 그래프 시각화 라이브러리
- **Chart.js**: 차트 라이브러리
- **Nginx**: 웹 서버

### DevOps
- **Docker Compose**: 컨테이너 오케스트레이션
- **Health Checks**: 서비스 상태 모니터링
- **Volume Management**: 데이터 영속성

## 🚀 빠른 시작

### 1. 환경 요구사항
- Docker & Docker Compose
- 최소 4GB RAM
- 포트 3001, 8001, 7474, 8086, 3003 사용 가능

### 2. 설치 및 실행
```bash
# 저장소 클론
git clone <repository-url>
cd manufacturing-ontology

# Docker Compose로 모든 서비스 시작
docker-compose up -d

# 서비스 상태 확인
docker-compose ps
```

### 3. 서비스 접속
- **메인 애플리케이션**: http://localhost:3001
- **API 문서**: http://localhost:8001/docs
- **Neo4j 브라우저**: http://localhost:7474
- **InfluxDB**: http://localhost:8086
- **Grafana**: http://localhost:3003

### 4. 기본 로그인 정보
- **Neo4j**: neo4j / password
- **InfluxDB**: admin / password123
- **Grafana**: admin / admin

## 📖 사용 가이드

### 온톨로지 데이터 업로드
1. **Data Manager** 페이지로 이동
2. TTL 파일을 드래그 앤 드롭
3. 자동 검증 및 로딩 확인

### 관계 편집
1. **Relationship Editor** 페이지로 이동
2. Subject, Predicate, Object 입력
3. 실시간 검증 및 추가

### 대시보드 모니터링
1. **Dashboard** 페이지로 이동
2. KPI 카드 및 차트 확인
3. 자동 새로고침 설정

### 그래프 시각화
1. **Graph View** 페이지로 이동
2. 레이아웃 및 필터 조정
3. 노드 클릭으로 상세 정보 확인

## 🔧 API 사용법

### 제조 데이터 관리
```python
# 작업지시서 생성
POST /manufacturing/work-orders
{
  "workOrderNumber": "WO001",
  "plannedQuantity": 100,
  "actualQuantity": 95,
  "status": "completed",
  "equipment_id": "ex:MachineA"
}

# 품질 데이터 조회
GET /manufacturing/quality/{product_id}

# 설비 효율성 계산
GET /analytics/equipment-efficiency/{equipment_id}
```

### 온톨로지 관계 관리
```python
# 관계 추가
POST /ontology/triples
{
  "subject": "ex:Equipment001",
  "predicate": "ex:locatedIn",
  "object": "ex:AreaA"
}

# 관계 조회
GET /ontology/triples?subject=ex:Equipment001

# 벌크 작업
POST /ontology/triples/bulk
{
  "add": [...],
  "delete": [...]
}
```

## 📊 샘플 데이터

### 제조 시나리오 예제
- **3개 설비**: Assembly, Testing, Packaging Machine
- **5개 센서**: Temperature, Pressure, Vibration, Quality, Speed
- **10개 작업지시서**: 다양한 상태와 수량
- **품질검사 데이터**: Pass/Fail/Pending 결과
- **유지보수 기록**: Preventive/Corrective/Predictive

### 데이터 생성 스크립트
```bash
# 샘플 데이터 생성
python scripts/generate_sample_data.py

# 생성된 데이터 확인
ls generated_data/
```

## 🔍 고급 기능

### 실시간 모니터링
- **WebSocket 연결**: 실시간 데이터 업데이트
- **알람 시스템**: 임계값 초과 시 자동 알림
- **트렌드 분석**: 시계열 데이터 패턴 분석

### 데이터 분석
- **OEE 계산**: 가용성 × 성능 × 품질
- **품질 트렌드**: 시간별 품질 지표 변화
- **설비 효율성**: 개별 설비 성능 분석

### 확장성
- **마이크로서비스**: 독립적인 서비스 구성
- **수평 확장**: 로드 밸런싱 지원
- **다중 테넌트**: 여러 제조사 지원

## 🛡️ 보안 및 성능

### 보안 기능
- **CORS 설정**: 크로스 오리진 요청 제어
- **입력 검증**: SHACL 기반 데이터 검증
- **에러 처리**: 안전한 에러 메시지

### 성능 최적화
- **인덱싱**: Neo4j 자동 인덱스 생성
- **캐싱**: API 응답 캐싱
- **압축**: 정적 파일 압축

## 🐛 트러블슈팅

### 일반적인 문제
1. **포트 충돌**: `docker-compose down` 후 재시작
2. **메모리 부족**: Docker 메모리 할당량 증가
3. **데이터 손실**: 볼륨 백업 확인

### 로그 확인
```bash
# 서비스별 로그 확인
docker-compose logs backend
docker-compose logs frontend
docker-compose logs neo4j

# 실시간 로그 모니터링
docker-compose logs -f
```

### 데이터베이스 초기화
```bash
# 모든 데이터 삭제
docker-compose down -v
docker-compose up -d
```

## 🤝 기여하기

### 개발 환경 설정
1. 저장소 포크
2. 개발 브랜치 생성
3. 로컬에서 테스트
4. Pull Request 생성

### 코딩 스타일
- **Python**: PEP 8 준수
- **JavaScript**: ESLint 설정 사용
- **CSS**: BEM 방법론 적용

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 지원

- **이슈 리포트**: GitHub Issues
- **문서**: [API 문서](docs/API.md)
- **사용자 가이드**: [사용자 가이드](docs/USER_GUIDE.md)

---

**Manufacturing Ontology System** - 제조 산업의 디지털 전환을 위한 통합 솔루션
