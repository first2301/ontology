// 그래프 관련 타입 정의

export interface CytoscapeNode {
  data: {
    id: string;
    label: string;
    types?: string[];
  };
}

export interface CytoscapeEdge {
  data: {
    id: string;
    source: string;
    target: string;
    label: string;
  };
}

export interface CytoscapeElement {
  nodes: CytoscapeNode[];
  edges: CytoscapeEdge[];
}

export type LayoutType = 'cose' | 'grid' | 'hierarchical' | 'circle';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface SelectedNode {
  id: string;
  label: string;
  type: string;
}

