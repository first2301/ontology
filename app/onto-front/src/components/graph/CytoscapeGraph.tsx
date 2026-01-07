'use client';

import { useEffect, useMemo } from 'react';
import { useCytoscape } from '@/lib/hooks/useCytoscape';
import { useGraphStore } from '@/lib/stores/graphStore';
import type { CytoscapeNode, CytoscapeEdge } from '@/types/graph';

interface CytoscapeGraphProps {
  nodes: CytoscapeNode[];
  edges: CytoscapeEdge[];
}

export default function CytoscapeGraph({ nodes, edges }: CytoscapeGraphProps) {
  const { selectedLayout, selectedTypes, selectedRelationships, searchQuery } =
    useGraphStore();
  const { setSelectedNode, setNodeCount, setEdgeCount } = useGraphStore();

  const { containerRef, loadGraph, applyLayout, filterByTypes, searchNodes, cy } =
    useCytoscape({
      containerId: 'cy',
      onNodeClick: (nodeId, label, type) => {
        setSelectedNode({ id: nodeId, label, type });
      },
      onNodeDeselect: () => {
        setSelectedNode(null);
      },
    });

  // 그래프 데이터 로드
  useEffect(() => {
    if (cy && (nodes.length > 0 || edges.length > 0)) {
      loadGraph(nodes, edges);
      setNodeCount(nodes.length);
      setEdgeCount(edges.length);
    }
  }, [nodes, edges, cy, loadGraph, setNodeCount, setEdgeCount]);

  // 레이아웃 변경
  useEffect(() => {
    if (cy) {
      applyLayout(selectedLayout);
    }
  }, [selectedLayout, cy, applyLayout]);

  // 필터 적용 (메모이제이션된 값 사용)
  const selectedTypesMemo = useMemo(() => selectedTypes, [selectedTypes.join(',')]);
  const selectedRelationshipsMemo = useMemo(() => selectedRelationships, [selectedRelationships.join(',')]);

  useEffect(() => {
    if (cy) {
      filterByTypes(selectedTypesMemo, selectedRelationshipsMemo);
    }
  }, [selectedTypesMemo, selectedRelationshipsMemo, cy, filterByTypes]);

  // 검색 적용
  useEffect(() => {
    if (cy) {
      searchNodes(searchQuery);
    }
  }, [searchQuery, cy, searchNodes]);

  return (
    <div
      ref={containerRef}
      id="cy"
      className="h-full w-full"
      style={{ minHeight: '600px' }}
    />
  );
}

