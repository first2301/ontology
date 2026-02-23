'use client';

import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import CytoscapeGraph from '@/components/graph/CytoscapeGraph';
import GraphControls from '@/components/graph/GraphControls';
import NodeDetailsPanel from '@/components/graph/NodeDetailsPanel';
import Loading from '@/components/common/Loading';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import { ontologyAPI } from '@/lib/api';
import { transformGraphElements } from '@/lib/utils/transformers';
import { useGraphStore } from '@/lib/stores/graphStore';
import { useEffect, useMemo } from 'react';

export default function GraphPage() {
  const {
    graphLimit,
    searchQuery,
    selectedTypes,
    selectedRelationships,
    nodeTypes,
    relationshipTypes,
    nodeCount,
    edgeCount,
    setNodeTypes,
    setRelationshipTypes,
    setSearchQuery,
    toggleType,
    toggleRelationship,
  } = useGraphStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['graph-elements', graphLimit],
    queryFn: () => ontologyAPI.getGraphElements(graphLimit),
    retry: false, // 에러 발생 시 자동 재시도 비활성화 (필요시 수동으로 재시도)
  });

  // 노드 타입과 관계 타입 추출
  useEffect(() => {
    if (data) {
      const transformed = transformGraphElements(data);
      const types = new Set<string>();
      const rels = new Set<string>();

      transformed.nodes.forEach((node) => {
        node.data.types?.forEach((type) => types.add(type));
      });

      transformed.edges.forEach((edge) => {
        rels.add(edge.data.label);
      });

      setNodeTypes(Array.from(types));
      setRelationshipTypes(Array.from(rels));
    }
  }, [data, setNodeTypes, setRelationshipTypes]);

  const graphData = useMemo(() => {
    return data ? transformGraphElements(data) : { nodes: [], edges: [] };
  }, [data]);

  const sidebarProps = {
    searchQuery,
    onSearchChange: setSearchQuery,
    nodeTypes,
    selectedTypes,
    onTypeToggle: toggleType,
    relationshipTypes,
    selectedRelationships,
    onRelationshipToggle: toggleRelationship,
    nodeCount,
    edgeCount,
  };

  return (
    <MainLayout showSidebar sidebarProps={sidebarProps}>
      <div className="flex h-full flex-col">
        <div className="border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Ontology Graph Visualization
              </h2>
              <GraphControls onReload={() => refetch()} />
            </div>
          </div>
        </div>
        <div className="relative flex-1">
          {isLoading ? (
            <Loading fullScreen message="Loading graph data..." />
          ) : error ? (
            <ErrorDisplay error={error} onRetry={() => refetch()} title="Failed to load graph data" />
          ) : (
            <>
              <CytoscapeGraph nodes={graphData.nodes} edges={graphData.edges} />
              <NodeDetailsPanel />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

