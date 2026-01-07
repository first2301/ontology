'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape, { Core } from 'cytoscape';
import dagre from 'dagre';
// @ts-ignore
import cytoscapeDagre from 'cytoscape-dagre';
import type { CytoscapeNode, CytoscapeEdge, LayoutType } from '@/types/graph';
import { NODE_COLORS } from '@/lib/utils/constants';
import { extractNodeType } from '@/lib/utils/transformers';

// Cytoscape 확장 등록
cytoscape.use(cytoscapeDagre);

interface UseCytoscapeOptions {
  containerId: string;
  onNodeClick?: (nodeId: string, label: string, type: string) => void;
  onNodeDeselect?: () => void;
}

export function useCytoscape({ containerId, onNodeClick, onNodeDeselect }: UseCytoscapeOptions) {
  const [cy, setCy] = useState<Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onNodeClickRef = useRef(onNodeClick);
  const onNodeDeselectRef = useRef(onNodeDeselect);

  // 콜백 ref 업데이트
  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
    onNodeDeselectRef.current = onNodeDeselect;
  }, [onNodeClick, onNodeDeselect]);

  useEffect(() => {
    if (!containerRef.current) return;

    const cyInstance = cytoscape({
      container: containerRef.current,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'background-color': (ele) => {
              const types = ele.data('types') || [];
              const type = types[0] || 'Unknown';
              return NODE_COLORS[type] || '#6c757d';
            },
            color: '#fff',
            'font-size': '10px',
            'font-weight': '500',
            'text-outline-width': 1,
            'text-outline-color': '#000',
            width: 30,
            height: 30,
            'border-width': 2,
            'border-color': '#fff',
            'border-style': 'solid',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 3,
            'border-color': '#667eea',
            'background-color': '#667eea',
          },
        },
        {
          selector: 'node:hover',
          style: {
            'border-width': 3,
            'border-color': '#667eea',
          },
        },
        {
          selector: 'edge',
          style: {
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-size': 8,
            label: 'data(label)',
            'font-size': '8px',
            'font-weight': '400',
            'line-color': '#999',
            'target-arrow-color': '#999',
            width: 2,
            'text-outline-width': 1,
            'text-outline-color': '#fff',
            'text-background-color': '#fff',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px',
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#667eea',
            'target-arrow-color': '#667eea',
            width: 3,
          },
        },
        {
          selector: 'edge:hover',
          style: {
            'line-color': '#667eea',
            'target-arrow-color': '#667eea',
            width: 3,
          },
        },
      ],
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
      selectionType: 'single',
    });

    // 이벤트 리스너
    cyInstance.on('tap', 'node', (event) => {
      const node = event.target;
      const label = node.data('label') || '';
      const types = node.data('types') || [];
      const type = extractNodeType(label);
      onNodeClickRef.current?.(node.id(), label, type);
    });

    cyInstance.on('tap', (event) => {
      if (event.target === cyInstance) {
        onNodeDeselectRef.current?.();
      }
    });

    setCy(cyInstance);

    return () => {
      cyInstance.destroy();
    };
  }, [containerId]);

  const applyLayout = useCallback((layoutType: LayoutType) => {
    if (!cy) return;

    const layouts: Record<LayoutType, any> = {
      cose: { name: 'cose', animate: false },
      grid: { name: 'grid', animate: false },
      hierarchical: { name: 'dagre', animate: false },
      circle: { name: 'circle', animate: false },
    };

    const layout = layouts[layoutType];
    if (layout) {
      cy.layout(layout).run();
      cy.fit();
    }
  }, [cy]);

  const loadGraph = useCallback((nodes: CytoscapeNode[], edges: CytoscapeEdge[]) => {
    if (!cy) return;

    cy.elements().remove();
    cy.add([...nodes, ...edges]);
    applyLayout('cose');
  }, [cy, applyLayout]);

  const filterByTypes = useCallback((selectedTypes: string[], selectedRelationships: string[]) => {
    if (!cy) return;

    const filteredNodeIds = new Set<string>();

    // 노드 필터링
    cy.nodes().forEach((node) => {
      const types = node.data('types') || [];
      const type = extractNodeType(node.data('label') || '');
      if (selectedTypes.length === 0 || selectedTypes.includes(type)) {
        filteredNodeIds.add(node.id());
        node.show();
      } else {
        node.hide();
      }
    });

    // 엣지 필터링
    cy.edges().forEach((edge) => {
      const sourceVisible = filteredNodeIds.has(edge.source().id());
      const targetVisible = filteredNodeIds.has(edge.target().id());
      const relationshipVisible =
        selectedRelationships.length === 0 ||
        selectedRelationships.includes(edge.data('label'));

      if (sourceVisible && targetVisible && relationshipVisible) {
        edge.show();
      } else {
        edge.hide();
      }
    });

    applyLayout('cose');
  }, [cy, applyLayout]);

  const searchNodes = useCallback((query: string) => {
    if (!cy) return;

    if (!query) {
      cy.elements().show();
      applyLayout('cose');
      return;
    }

    const searchQuery = query.toLowerCase();
    cy.elements().forEach((element) => {
      const label = element.data('label') || '';
      if (label.toLowerCase().includes(searchQuery)) {
        element.show();
      } else {
        element.hide();
      }
    });

    applyLayout('cose');
  }, [cy, applyLayout]);

  return {
    cy,
    containerRef,
    loadGraph,
    applyLayout,
    filterByTypes,
    searchNodes,
  };
}

