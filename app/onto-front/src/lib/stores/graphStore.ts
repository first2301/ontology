'use client';

import { create } from 'zustand';
import type { SelectedNode, LayoutType } from '@/types/graph';

interface GraphState {
  selectedNode: SelectedNode | null;
  selectedLayout: LayoutType;
  graphLimit: number;
  searchQuery: string;
  selectedTypes: string[];
  selectedRelationships: string[];
  nodeTypes: string[];
  relationshipTypes: string[];
  nodeCount: number;
  edgeCount: number;
  
  // Actions
  setSelectedNode: (node: SelectedNode | null) => void;
  setSelectedLayout: (layout: LayoutType) => void;
  setGraphLimit: (limit: number) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTypes: (types: string[]) => void;
  setSelectedRelationships: (relationships: string[]) => void;
  setNodeTypes: (types: string[]) => void;
  setRelationshipTypes: (types: string[]) => void;
  setNodeCount: (count: number) => void;
  setEdgeCount: (count: number) => void;
  toggleType: (type: string) => void;
  toggleRelationship: (rel: string) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  selectedNode: null,
  selectedLayout: 'cose',
  graphLimit: 100,
  searchQuery: '',
  selectedTypes: [],
  selectedRelationships: [],
  nodeTypes: [],
  relationshipTypes: [],
  nodeCount: 0,
  edgeCount: 0,

  setSelectedNode: (node) => set({ selectedNode: node }),
  setSelectedLayout: (layout) => set({ selectedLayout: layout }),
  setGraphLimit: (limit) => set({ graphLimit: limit }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTypes: (types) => set({ selectedTypes: types }),
  setSelectedRelationships: (relationships) => set({ selectedRelationships: relationships }),
  setNodeTypes: (types) => set({ nodeTypes: types }),
  setRelationshipTypes: (types) => set({ relationshipTypes: types }),
  setNodeCount: (count) => set({ nodeCount: count }),
  setEdgeCount: (count) => set({ edgeCount: count }),
  toggleType: (type) =>
    set((state) => ({
      selectedTypes: state.selectedTypes.includes(type)
        ? state.selectedTypes.filter((t) => t !== type)
        : [...state.selectedTypes, type],
    })),
  toggleRelationship: (rel) =>
    set((state) => ({
      selectedRelationships: state.selectedRelationships.includes(rel)
        ? state.selectedRelationships.filter((r) => r !== rel)
        : [...state.selectedRelationships, rel],
    })),
}));

