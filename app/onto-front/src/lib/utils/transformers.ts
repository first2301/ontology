// API 응답 변환 유틸리티

import type { GraphElementsResponse, GraphElement } from '@/types/api';
import type { CytoscapeNode, CytoscapeEdge } from '@/types/graph';

/**
 * 그래프 요소를 Cytoscape.js 형식으로 변환
 */
export function transformGraphElements(
  response: GraphElementsResponse
): { nodes: CytoscapeNode[]; edges: CytoscapeEdge[] } {
  const elements = response.elements || [];
  const nodesMap = new Map<string, CytoscapeNode>();
  const edges: CytoscapeEdge[] = [];

  elements.forEach((element) => {
    if (element.data.source && element.data.target) {
      // 엣지
      edges.push({
        data: {
          id: element.data.id,
          source: element.data.source,
          target: element.data.target,
          label: element.data.label || '',
        },
      });
    } else {
      // 노드
      nodesMap.set(element.data.id, {
        data: {
          id: element.data.id,
          label: element.data.label || 'node',
          types: element.data.types || [],
        },
      });
    }
  });

  return {
    nodes: Array.from(nodesMap.values()),
    edges,
  };
}

/**
 * 노드 타입 추출
 */
export function extractNodeType(label: string): string {
  if (!label) return 'Unknown';

  const typeMap: Record<string, string> = {
    Equipment: 'Equipment',
    Sensor: 'Sensor',
    Variable: 'Variable',
    Unit: 'Unit',
    Process: 'Process',
    Operation: 'Operation',
    Material: 'Material',
    Product: 'Product',
    Area: 'Area',
    WorkOrder: 'WorkOrder',
    QualityControl: 'QualityControl',
    Maintenance: 'Maintenance',
    Batch: 'Batch',
    Defect: 'Defect',
  };

  for (const [type, keyword] of Object.entries(typeMap)) {
    if (label.includes(keyword)) {
      return type;
    }
  }

  return 'Unknown';
}

