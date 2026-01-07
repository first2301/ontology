'use client';

import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  nodeTypes: string[];
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
  relationshipTypes: string[];
  selectedRelationships: string[];
  onRelationshipToggle: (rel: string) => void;
  nodeCount: number;
  edgeCount: number;
}

export default function Sidebar({
  searchQuery,
  onSearchChange,
  nodeTypes,
  selectedTypes,
  onTypeToggle,
  relationshipTypes,
  selectedRelationships,
  onRelationshipToggle,
  nodeCount,
  edgeCount,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="border-r border-gray-200 bg-white" aria-label="Sidebar filters">
        <div className="flex h-full flex-col">
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Expand sidebar"
            aria-expanded="false"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r border-gray-200 bg-white" aria-label="Sidebar filters">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 p-2">
          <h2 className="text-sm font-semibold">Filters</h2>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Collapse sidebar"
            aria-expanded="true"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search nodes..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="Search nodes"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Node Types</h3>
            <div className="space-y-2">
              {nodeTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => onTypeToggle(type)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label={`Filter by ${type} node type`}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              Relationship Types
            </h3>
            <div className="space-y-2">
              {relationshipTypes.map((rel) => (
                <label
                  key={rel}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <input
                    type="checkbox"
                    checked={selectedRelationships.includes(rel)}
                    onChange={() => onRelationshipToggle(rel)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label={`Filter by ${rel} relationship type`}
                  />
                  <span>{rel}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Statistics</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Nodes:</span>
                <span className="font-medium">{nodeCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Edges:</span>
                <span className="font-medium">{edgeCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

