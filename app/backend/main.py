from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from neo4j import GraphDatabase
from rdflib import Graph
from pyshacl import validate
import os
import glob
from typing import List, Optional, Dict, Any
from datetime import datetime

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASS = os.getenv("NEO4J_PASS", "passwd")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS))
app = FastAPI(title="Manufacturing Ontology API", version="2.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:80", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def neo4j_run(cypher: str, **params):
    with driver.session() as s:
        return list(s.run(cypher, **params))

def ensure_n10s_config():
    """n10s 설정 초기화 (안전한 방식)"""
    try:
        # 먼저 현재 설정 상태 확인
        result = neo4j_run("CALL n10s.graphconfig.show()")
        if result:
            print("n10s already configured, skipping initialization")
            return
    except Exception:
        # 설정이 없으면 초기화
        pass
    
    try:
        neo4j_run("""
        CALL n10s.graphconfig.init({
          handleVocabUris: "SHORTEN", keepLangTag: false, typesToLabels: true
        })
        """)
        print("n10s configuration initialized successfully")
    except Exception as e:
        if "non-empty" in str(e):
            print("Graph is not empty, n10s configuration already exists")
        else:
            print(f"Warning: n10s configuration failed: {e}")
    
    # 인덱스(성능/중복 방지, 선택)
    try:
        neo4j_run("CREATE CONSTRAINT n10s_uri IF NOT EXISTS FOR (r:Resource) REQUIRE r.uri IS UNIQUE")
    except Exception as e:
        print(f"Warning: Constraint creation failed: {e}")

def load_ontology_files():
    """온톨로지 파일들을 자동으로 로딩"""
    ontology_dir = "/app/ontology"
    if os.path.exists(ontology_dir):
        # SHACL shapes 파일은 적재 대상에서 제외 (검증 전용)
        ttl_files = [
            f for f in glob.glob(os.path.join(ontology_dir, "*.ttl"))
            if not os.path.basename(f).lower().startswith("shapes")
        ]
        for ttl_file in ttl_files:
            try:
                with open(ttl_file, 'r', encoding='utf-8') as f:
                    ttl_content = f.read()
                
                # n10s를 사용하여 RDF 데이터 로딩
                neo4j_run("""
                CALL n10s.rdf.import.inline($ttl, "Turtle")
                YIELD terminationStatus, triplesLoaded
                RETURN terminationStatus AS status, triplesLoaded AS count
                """, ttl=ttl_content)
                
                print(f"Loaded ontology file: {os.path.basename(ttl_file)}")
            except Exception as e:
                print(f"Error loading {ttl_file}: {e}")

@app.on_event("startup")
def startup():
    ensure_n10s_config()
    load_ontology_files()

# Pydantic 모델들
class ImportResult(BaseModel):
    triplesLoaded: int
    validationConforms: bool
    report: Optional[str] = None

class Triple(BaseModel):
    subject: str
    predicate: str
    object: str

class TripleResponse(BaseModel):
    subject: str
    predicate: str
    object: str
    subject_label: Optional[str] = None
    object_label: Optional[str] = None

class BulkTripleOperation(BaseModel):
    add: List[Triple] = []
    delete: List[Triple] = []

class WorkOrder(BaseModel):
    workOrderNumber: str
    plannedQuantity: int
    actualQuantity: Optional[int] = 0
    status: str
    equipment_id: Optional[str] = None

class QualityControl(BaseModel):
    product_id: str
    qualityResult: str
    timestamp: datetime

class EquipmentStatus(BaseModel):
    equipment_id: str
    status: str
    lastMaintenance: Optional[datetime] = None
    nextMaintenance: Optional[datetime] = None

# 기존 API들
@app.post("/ontology/validate-and-import", response_model=ImportResult)
async def validate_and_import(
    data_ttl: UploadFile = File(...),
    shapes_ttl: UploadFile = File(...)
):
    data_bytes = await data_ttl.read()
    shapes_bytes = await shapes_ttl.read()

    # 1) SHACL 검증
    data_g = Graph().parse(data=data_bytes.decode("utf-8"), format="turtle")
    shapes_g = Graph().parse(data=shapes_bytes.decode("utf-8"), format="turtle")
    conforms, report_graph, report_text = validate(
        data_g, shacl_graph=shapes_g, inference="rdfs", serialize_report_graph=True
    )
    if not conforms:
        # 검증 실패 시 리턴(적재 안 함) + 보고서 포함
        return ImportResult(triplesLoaded=0, validationConforms=False, report=report_text)

    # 2) Neo4j n10s inline import
    res = neo4j_run("""
    CALL n10s.rdf.import.inline($ttl, "Turtle")
    YIELD terminationStatus, triplesLoaded
    RETURN terminationStatus AS status, triplesLoaded AS count
    """, ttl=data_bytes.decode("utf-8"))
    count = res[0]["count"] if res else 0
    return ImportResult(triplesLoaded=count, validationConforms=True)

@app.get("/graph/elements")
def graph_elements(limit: int = Query(100, ge=1, le=1000)):
    """
    Cytoscape.js용 elements JSON (노드/엣지)
    """
    rows = neo4j_run("""
    MATCH (n)-[r]->(m)
    RETURN id(n) AS sid,
           labels(n) AS sTypes,
           coalesce(n.`rdfs__label`, n.name, head(labels(n))) AS sLabel,
           type(r) AS rel,
           id(m) AS tid,
           labels(m) AS tTypes,
           coalesce(m.`rdfs__label`, m.name, head(labels(m))) AS tLabel
    LIMIT $limit
    """, limit=limit)

    nodes = {}
    edges = []
    for row in rows:
        sid = f"n{row['sid']}"
        tid = f"n{row['tid']}"
        nodes[sid] = {"data": {"id": sid, "label": row["sLabel"] or "node", "types": row.get("sTypes", [])}}
        nodes[tid] = {"data": {"id": tid, "label": row["tLabel"] or "node", "types": row.get("tTypes", [])}}
        eid = f"{sid}->{tid}:{row['rel']}"
        edges.append({"data": {"id": eid, "source": sid, "target": tid, "label": row["rel"]}})
    return {"elements": list(nodes.values()) + edges}

# 새로운 제조 데이터 관리 API들
@app.get("/manufacturing/lines")
def get_manufacturing_lines():
    """제조 라인 목록 조회"""
    rows = neo4j_run("""
    MATCH (e:Equipment)
    WHERE e.uri CONTAINS 'Equipment'
    RETURN e.uri AS id, 
           coalesce(e.`rdfs__label`, e.name, 'Unnamed Equipment') AS name,
           labels(e) AS types
    """)
    return {"lines": [dict(row) for row in rows]}

@app.get("/manufacturing/lines/{line_id}")
def get_manufacturing_line(line_id: str):
    """특정 제조 라인 상세 조회"""
    rows = neo4j_run("""
    MATCH (e:Equipment {uri: $line_id})
    OPTIONAL MATCH (e)-[r]->(related)
    RETURN e, r, related
    """, line_id=line_id)
    
    if not rows:
        raise HTTPException(status_code=404, detail="Line not found")
    
    return {"line": dict(rows[0])}

@app.get("/manufacturing/work-orders")
def get_work_orders():
    """작업지시서 목록 조회"""
    rows = neo4j_run("""
    MATCH (w:WorkOrder)
    OPTIONAL MATCH (w)-[:executedBy]->(e:Equipment)
    RETURN w.uri AS id,
           w.workOrderNumber AS workOrderNumber,
           w.plannedQuantity AS plannedQuantity,
           w.actualQuantity AS actualQuantity,
           w.status AS status,
           coalesce(e.`rdfs__label`, e.name) AS equipmentName
    """)
    return {"workOrders": [dict(row) for row in rows]}

@app.post("/manufacturing/work-orders")
def create_work_order(work_order: WorkOrder):
    """작업지시서 생성"""
    work_order_id = f"ex:WO_{work_order.workOrderNumber}"
    
    neo4j_run("""
    CREATE (w:WorkOrder {
        uri: $id,
        workOrderNumber: $workOrderNumber,
        plannedQuantity: $plannedQuantity,
        actualQuantity: $actualQuantity,
        status: $status
    })
    """, 
    id=work_order_id,
    workOrderNumber=work_order.workOrderNumber,
    plannedQuantity=work_order.plannedQuantity,
    actualQuantity=work_order.actualQuantity,
    status=work_order.status)
    
    # 설비 연결
    if work_order.equipment_id:
        neo4j_run("""
        MATCH (w:WorkOrder {uri: $workOrderId})
        MATCH (e:Equipment {uri: $equipmentId})
        CREATE (w)-[:executedBy]->(e)
        """, workOrderId=work_order_id, equipmentId=work_order.equipment_id)
    
    return {"id": work_order_id, "message": "Work order created successfully"}

@app.get("/manufacturing/quality/{product_id}")
def get_quality_data(product_id: str):
    """제품 품질 데이터 조회"""
    rows = neo4j_run("""
    MATCH (p:Product {uri: $product_id})-[:hasQuality]->(q:QualityControl)
    RETURN q.uri AS id,
           q.qualityResult AS qualityResult,
           q.timestamp AS timestamp
    """, product_id=product_id)
    return {"qualityData": [dict(row) for row in rows]}

@app.post("/manufacturing/quality")
def create_quality_data(quality: QualityControl):
    """품질 데이터 생성"""
    quality_id = f"ex:QC_{quality.product_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    neo4j_run("""
    MATCH (p:Product {uri: $productId})
    CREATE (q:QualityControl {
        uri: $qualityId,
        qualityResult: $qualityResult,
        timestamp: $timestamp
    })
    CREATE (p)-[:hasQuality]->(q)
    """,
    productId=quality.product_id,
    qualityId=quality_id,
    qualityResult=quality.qualityResult,
    timestamp=quality.timestamp)
    
    return {"id": quality_id, "message": "Quality data created successfully"}

@app.get("/manufacturing/equipment/{equipment_id}/status")
def get_equipment_status(equipment_id: str):
    """설비 상태 조회"""
    rows = neo4j_run("""
    MATCH (e:Equipment {uri: $equipment_id})
    OPTIONAL MATCH (e)-[:hasMaintenance]->(m:Maintenance)
    RETURN e.uri AS id,
           e.status AS status,
           m.timestamp AS lastMaintenance,
           m.maintenanceType AS maintenanceType
    ORDER BY m.timestamp DESC
    LIMIT 1
    """, equipment_id=equipment_id)
    
    if not rows:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    return {"equipment": dict(rows[0])}

@app.get("/manufacturing/equipment/{equipment_id}/maintenance-history")
def get_maintenance_history(equipment_id: str):
    """설비 유지보수 이력 조회"""
    rows = neo4j_run("""
    MATCH (e:Equipment {uri: $equipment_id})-[:hasMaintenance]->(m:Maintenance)
    RETURN m.uri AS id,
           m.maintenanceType AS maintenanceType,
           m.timestamp AS timestamp
    ORDER BY m.timestamp DESC
    """, equipment_id=equipment_id)
    return {"maintenanceHistory": [dict(row) for row in rows]}

# 고급 쿼리 API들
@app.get("/graph/process-flow/{process_id}")
def get_process_flow(process_id: str):
    """프로세스 플로우 조회"""
    rows = neo4j_run("""
    MATCH (p:Process {uri: $process_id})-[:precedes*]->(ops:Operation)
    RETURN ops.uri AS operationId,
           ops.`rdfs__label` AS operationName,
           ops.precedes AS nextOperation
    """, process_id=process_id)
    return {"processFlow": [dict(row) for row in rows]}

@app.get("/graph/equipment-hierarchy")
def get_equipment_hierarchy():
    """설비 계층구조 조회"""
    rows = neo4j_run("""
    MATCH (parent:Equipment)-[:hasPart]->(child:Equipment)
    RETURN parent.uri AS parentId,
           parent.`rdfs__label` AS parentName,
           child.uri AS childId,
           child.`rdfs__label` AS childName
    """)
    return {"hierarchy": [dict(row) for row in rows]}

@app.get("/analytics/quality-trend")
def get_quality_trend(period: str = "7d"):
    """품질 트렌드 분석"""
    rows = neo4j_run("""
    MATCH (q:QualityControl)
    WHERE q.timestamp >= datetime() - duration('P7D')
    RETURN date(q.timestamp) AS date,
           q.qualityResult AS result,
           count(*) AS count
    ORDER BY date
    """)
    return {"trend": [dict(row) for row in rows]}

@app.get("/analytics/equipment-efficiency/{equipment_id}")
def get_equipment_efficiency(equipment_id: str):
    """설비 효율성 (OEE) 계산"""
    rows = neo4j_run("""
    MATCH (e:Equipment {uri: $equipment_id})-[:executedBy]<-()-[w:WorkOrder]
    RETURN 
        count(w) AS totalOrders,
        sum(w.plannedQuantity) AS plannedQuantity,
        sum(w.actualQuantity) AS actualQuantity,
        avg(CASE WHEN w.status = 'completed' THEN 1.0 ELSE 0.0 END) AS availability,
        avg(CASE WHEN w.actualQuantity >= w.plannedQuantity THEN 1.0 ELSE 0.0 END) AS performance,
        avg(CASE WHEN w.status = 'completed' AND w.actualQuantity >= w.plannedQuantity THEN 1.0 ELSE 0.0 END) AS quality
    """, equipment_id=equipment_id)
    
    if rows:
        data = dict(rows[0])
        data['oee'] = data['availability'] * data['performance'] * data['quality']
        return {"efficiency": data}
    return {"efficiency": None}

# 온톨로지 관계 관리 API (CRUD)
@app.post("/ontology/triples")
def create_triple(triple: Triple):
    """관계(Triple) 추가"""
    try:
        neo4j_run("""
        MATCH (s:Resource {uri: $subject})
        MATCH (o:Resource {uri: $object})
        CALL apoc.create.relationship(s, $predicate, {}, o) YIELD rel
        RETURN rel
        """,
        subject=triple.subject,
        predicate=triple.predicate,
        object=triple.object)
        
        return {"message": "Triple created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/ontology/triples")
def get_triples(subject: Optional[str] = None, predicate: Optional[str] = None, object: Optional[str] = None):
    """관계 조회"""
    where_clauses = []
    params = {}
    
    if subject:
        where_clauses.append("s.uri = $subject")
        params["subject"] = subject
    if predicate:
        where_clauses.append("type(r) = $predicate")
        params["predicate"] = predicate
    if object:
        where_clauses.append("o.uri = $object")
        params["object"] = object
    
    where_clause = " AND ".join(where_clauses) if where_clauses else "1=1"
    
    rows = neo4j_run(f"""
    MATCH (s)-[r]->(o)
    WHERE {where_clause}
    RETURN s.uri AS subject,
           type(r) AS predicate,
           o.uri AS object,
           coalesce(s.`rdfs__label`, s.name) AS subject_label,
           coalesce(o.`rdfs__label`, o.name) AS object_label
    """, **params)
    
    return {"triples": [dict(row) for row in rows]}

@app.delete("/ontology/triples")
def delete_triple(triple: Triple):
    """관계 삭제"""
    try:
        result = neo4j_run("""
        MATCH (s:Resource {uri: $subject})-[r]->(o:Resource {uri: $object})
        WHERE type(r) = $predicate
        DELETE r
        RETURN count(r) AS deleted
        """,
        subject=triple.subject,
        predicate=triple.predicate,
        object=triple.object)
        
        if result and result[0]["deleted"] > 0:
            return {"message": "Triple deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Triple not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/ontology/nodes/{node_id}")
def delete_node(node_id: str):
    """노드 삭제 (관련 관계 모두 삭제)"""
    try:
        result = neo4j_run("""
        MATCH (n:Resource {uri: $node_id})
        DETACH DELETE n
        RETURN count(n) AS deleted
        """, node_id=node_id)
        
        if result and result[0]["deleted"] > 0:
            return {"message": "Node and all related relationships deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Node not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/ontology/triples/bulk")
def bulk_triple_operation(operation: BulkTripleOperation):
    """벌크 작업"""
    results = {"added": 0, "deleted": 0, "errors": []}
    
    # 추가 작업
    for triple in operation.add:
        try:
            neo4j_run("""
            MATCH (s:Resource {uri: $subject})
            MATCH (o:Resource {uri: $object})
            CALL apoc.create.relationship(s, $predicate, {}, o) YIELD rel
            RETURN rel
            """,
            subject=triple.subject,
            predicate=triple.predicate,
            object=triple.object)
            results["added"] += 1
        except Exception as e:
            results["errors"].append(f"Add error: {str(e)}")
    
    # 삭제 작업
    for triple in operation.delete:
        try:
            neo4j_run("""
            MATCH (s:Resource {uri: $subject})-[r]->(o:Resource {uri: $object})
            WHERE type(r) = $predicate
            DELETE r
            """,
            subject=triple.subject,
            predicate=triple.predicate,
            object=triple.object)
            results["deleted"] += 1
        except Exception as e:
            results["errors"].append(f"Delete error: {str(e)}")
    
    return results
