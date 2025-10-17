# Manufacturing Ontology API 문서

## 개요

Manufacturing Ontology System의 REST API 문서입니다. 이 API는 제조 산업데이터 온톨로지의 생성, 조회, 수정, 삭제 작업을 제공합니다.

## 기본 정보

- **Base URL**: `http://localhost:8001`
- **API 버전**: v2.0.0
- **Content-Type**: `application/json`
- **인증**: 현재 인증 없음 (향후 JWT 토큰 지원 예정)

## 응답 형식

모든 API 응답은 JSON 형식으로 반환됩니다.

### 성공 응답
```json
{
  "data": {...},
  "message": "Success",
  "status": 200
}
```

### 에러 응답
```json
{
  "error": "Error message",
  "status": 400,
  "details": {...}
}
```

## 엔드포인트

### 1. 온톨로지 관리

#### 1.1 그래프 요소 조회
```http
GET /graph/elements
```

**파라미터:**
- `limit` (query, optional): 조회할 요소 수 (기본값: 100, 최대: 1000)

**응답:**
```json
{
  "elements": [
    {
      "data": {
        "id": "n1",
        "label": "Machine A"
      }
    },
    {
      "data": {
        "id": "e1",
        "source": "n1",
        "target": "n2",
        "label": "partOf"
      }
    }
  ]
}
```

#### 1.2 관계 조회
```http
GET /ontology/triples
```

**파라미터:**
- `subject` (query, optional): 주체 URI
- `predicate` (query, optional): 관계 타입
- `object` (query, optional): 객체 URI

**응답:**
```json
{
  "triples": [
    {
      "subject": "ex:Equipment001",
      "predicate": "locatedIn",
      "object": "ex:AreaA",
      "subject_label": "Machine A",
      "object_label": "Assembly Area"
    }
  ]
}
```

#### 1.3 관계 추가
```http
POST /ontology/triples
```

**요청 본문:**
```json
{
  "subject": "ex:Equipment001",
  "predicate": "locatedIn",
  "object": "ex:AreaA"
}
```

**응답:**
```json
{
  "message": "Triple created successfully"
}
```

#### 1.4 관계 삭제
```http
DELETE /ontology/triples
```

**요청 본문:**
```json
{
  "subject": "ex:Equipment001",
  "predicate": "locatedIn",
  "object": "ex:AreaA"
}
```

#### 1.5 노드 삭제
```http
DELETE /ontology/nodes/{node_id}
```

**파라미터:**
- `node_id` (path): 삭제할 노드의 URI

#### 1.6 벌크 작업
```http
POST /ontology/triples/bulk
```

**요청 본문:**
```json
{
  "add": [
    {
      "subject": "ex:Equipment001",
      "predicate": "locatedIn",
      "object": "ex:AreaA"
    }
  ],
  "delete": [
    {
      "subject": "ex:Equipment002",
      "predicate": "partOf",
      "object": "ex:Equipment001"
    }
  ]
}
```

**응답:**
```json
{
  "added": 1,
  "deleted": 1,
  "errors": []
}
```

#### 1.7 파일 업로드 및 검증
```http
POST /ontology/validate-and-import
```

**파라미터:**
- `data_ttl` (form-data): 데이터 TTL 파일
- `shapes_ttl` (form-data): SHACL 스키마 파일

**응답:**
```json
{
  "triplesLoaded": 150,
  "validationConforms": true
}
```

### 2. 제조 데이터 관리

#### 2.1 제조 라인 조회
```http
GET /manufacturing/lines
```

**응답:**
```json
{
  "lines": [
    {
      "id": "ex:ProductionLine1",
      "name": "Production Line 1",
      "types": ["Equipment"]
    }
  ]
}
```

#### 2.2 특정 제조 라인 조회
```http
GET /manufacturing/lines/{line_id}
```

#### 2.3 작업지시서 목록 조회
```http
GET /manufacturing/work-orders
```

**응답:**
```json
{
  "workOrders": [
    {
      "id": "ex:WO_001",
      "workOrderNumber": "WO001",
      "plannedQuantity": 100,
      "actualQuantity": 95,
      "status": "completed",
      "equipmentName": "Machine A"
    }
  ]
}
```

#### 2.4 작업지시서 생성
```http
POST /manufacturing/work-orders
```

**요청 본문:**
```json
{
  "workOrderNumber": "WO001",
  "plannedQuantity": 100,
  "actualQuantity": 95,
  "status": "completed",
  "equipment_id": "ex:MachineA"
}
```

#### 2.5 품질 데이터 조회
```http
GET /manufacturing/quality/{product_id}
```

#### 2.6 품질 데이터 생성
```http
POST /manufacturing/quality
```

**요청 본문:**
```json
{
  "product_id": "ex:ProductA",
  "qualityResult": "pass",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

#### 2.7 설비 상태 조회
```http
GET /manufacturing/equipment/{equipment_id}/status
```

#### 2.8 유지보수 이력 조회
```http
GET /manufacturing/equipment/{equipment_id}/maintenance-history
```

### 3. 분석 및 쿼리

#### 3.1 프로세스 플로우 조회
```http
GET /graph/process-flow/{process_id}
```

#### 3.2 설비 계층구조 조회
```http
GET /graph/equipment-hierarchy
```

#### 3.3 품질 트렌드 분석
```http
GET /analytics/quality-trend
```

**파라미터:**
- `period` (query, optional): 분석 기간 (기본값: "7d")

#### 3.4 설비 효율성 (OEE) 계산
```http
GET /analytics/equipment-efficiency/{equipment_id}
```

**응답:**
```json
{
  "efficiency": {
    "totalOrders": 10,
    "plannedQuantity": 1000,
    "actualQuantity": 950,
    "availability": 0.95,
    "performance": 0.90,
    "quality": 0.98,
    "oee": 0.84
  }
}
```

## 데이터 모델

### 온톨로지 클래스

#### Equipment (설비)
- `uri`: 고유 식별자
- `rdfs:label`: 설비명
- `code`: 설비 코드
- `status`: 상태 (active, maintenance, idle, error)

#### Sensor (센서)
- `uri`: 고유 식별자
- `rdfs:label`: 센서명
- `measures`: 측정 변수
- `locatedIn`: 설치 위치

#### WorkOrder (작업지시서)
- `workOrderNumber`: 작업지시서 번호
- `plannedQuantity`: 계획 수량
- `actualQuantity`: 실적 수량
- `status`: 상태 (planned, in_progress, completed, cancelled)
- `timestamp`: 생성 시간

#### QualityControl (품질관리)
- `qualityResult`: 품질 결과 (pass, fail, pending)
- `timestamp`: 검사 시간

#### Maintenance (유지보수)
- `maintenanceType`: 유지보수 유형 (preventive, corrective, predictive)
- `timestamp`: 유지보수 시간

### 관계 타입

- `partOf`: 부분-전체 관계
- `measures`: 센서-변수 관계
- `locatedIn`: 위치 관계
- `executedBy`: 작업지시서-설비 관계
- `hasQuality`: 제품-품질관리 관계
- `hasMaintenance`: 설비-유지보수 관계
- `belongsToBatch`: 제품-배치 관계
- `hasDefect`: 제품-불량 관계

## 에러 코드

| 코드 | 설명 |
|------|------|
| 400 | 잘못된 요청 |
| 404 | 리소스를 찾을 수 없음 |
| 422 | 유효성 검사 실패 |
| 500 | 서버 내부 오류 |

## 예제

### Python 클라이언트 예제

```python
import requests

# API 기본 설정
BASE_URL = "http://localhost:8001"

# 작업지시서 생성
def create_work_order():
    url = f"{BASE_URL}/manufacturing/work-orders"
    data = {
        "workOrderNumber": "WO001",
        "plannedQuantity": 100,
        "actualQuantity": 95,
        "status": "completed",
        "equipment_id": "ex:MachineA"
    }
    response = requests.post(url, json=data)
    return response.json()

# 관계 추가
def add_relationship():
    url = f"{BASE_URL}/ontology/triples"
    data = {
        "subject": "ex:Equipment001",
        "predicate": "locatedIn",
        "object": "ex:AreaA"
    }
    response = requests.post(url, json=data)
    return response.json()

# 설비 효율성 조회
def get_equipment_efficiency(equipment_id):
    url = f"{BASE_URL}/analytics/equipment-efficiency/{equipment_id}"
    response = requests.get(url)
    return response.json()
```

### JavaScript 클라이언트 예제

```javascript
// API 기본 설정
const API_BASE = 'http://localhost:8001';

// 작업지시서 생성
async function createWorkOrder() {
    const response = await fetch(`${API_BASE}/manufacturing/work-orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            workOrderNumber: 'WO001',
            plannedQuantity: 100,
            actualQuantity: 95,
            status: 'completed',
            equipment_id: 'ex:MachineA'
        })
    });
    return await response.json();
}

// 관계 추가
async function addRelationship() {
    const response = await fetch(`${API_BASE}/ontology/triples`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            subject: 'ex:Equipment001',
            predicate: 'locatedIn',
            object: 'ex:AreaA'
        })
    });
    return await response.json();
}

// 그래프 요소 조회
async function getGraphElements(limit = 100) {
    const response = await fetch(`${API_BASE}/graph/elements?limit=${limit}`);
    return await response.json();
}
```

## 제한사항

- 최대 조회 제한: 1000개 요소
- 파일 업로드 크기: 10MB
- 동시 요청 수: 100개
- 세션 타임아웃: 30분

## 버전 관리

API 버전은 URL 경로에 포함됩니다. 현재 버전은 v2.0.0입니다.

### 버전 변경 사항

#### v2.0.0 (현재)
- 제조 특화 API 추가
- 벌크 작업 지원
- 실시간 분석 기능
- 향상된 에러 처리

#### v1.0.0 (이전)
- 기본 온톨로지 관리
- 단순 CRUD 작업
- 기본 시각화

## 지원

API 관련 문의사항은 다음을 통해 연락하세요:

- **이슈 리포트**: GitHub Issues
- **문서**: 이 API 문서
- **사용자 가이드**: [사용자 가이드](USER_GUIDE.md)
