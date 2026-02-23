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
      <aside 
        className="border-r border-gray-200 bg-white transition-all duration-300 ease-in-out" 
        aria-label="Sidebar filters"
      >
        <div className="flex h-full flex-col">
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Expand sidebar"
            aria-expanded="false"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" aria-hidden="true" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside 
      className="w-64 border-r border-gray-200 bg-white transition-all duration-300 ease-in-out shadow-sm md:relative md:z-auto z-50" 
      aria-label="Sidebar filters"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-gray-50/50">
          <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Collapse sidebar"
            aria-expanded="true"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Search */}
          <div>
            <label htmlFor="search-input" className="sr-only">Search nodes</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search nodes..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400"
                aria-label="Search nodes"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Node Types
              </h3>
              <div className="space-y-2">
                {nodeTypes.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No node types available</p>
                ) : (
                  nodeTypes.map((type) => (
                    <label
                      key={type}
                      className="group flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => onTypeToggle(type)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all cursor-pointer"
                        aria-label={`Filter by ${type} node type`}
                      />
                      <span className="flex-1">{type}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Relationship Types
              </h3>
              <div className="space-y-2">
                {relationshipTypes.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No relationship types available</p>
                ) : (
                  relationshipTypes.map((rel) => (
                    <label
                      key={rel}
                      className="group flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRelationships.includes(rel)}
                        onChange={() => onRelationshipToggle(rel)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all cursor-pointer"
                        aria-label={`Filter by ${rel} relationship type`}
                      />
                      <span className="flex-1">{rel}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="border-t border-gray-200 pt-4 mt-auto">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Statistics
            </h3>
            <div className="rounded-lg bg-gray-50 p-3 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Nodes:</span>
                <span className="font-semibold text-gray-900">{nodeCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Edges:</span>
                <span className="font-semibold text-gray-900">{edgeCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

