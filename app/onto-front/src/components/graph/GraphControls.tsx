'use client';

import { RefreshCw } from 'lucide-react';
import Button from '@/components/common/Button';
import { useGraphStore } from '@/lib/stores/graphStore';
import type { LayoutType } from '@/types/graph';
import { GRAPH_LAYOUTS } from '@/lib/utils/constants';

interface GraphControlsProps {
  onReload: () => void;
}

export default function GraphControls({ onReload }: GraphControlsProps) {
  const { selectedLayout, setSelectedLayout, graphLimit, setGraphLimit } =
    useGraphStore();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={onReload} variant="primary" size="sm">
        <RefreshCw className="h-4 w-4" />
        <span>Reload</span>
      </Button>
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="layout-select">
          Select graph layout
        </label>
        <select
          id="layout-select"
          value={selectedLayout}
          onChange={(e) => setSelectedLayout(e.target.value as LayoutType)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400"
          aria-label="Select graph layout"
        >
          {Object.entries(GRAPH_LAYOUTS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="graph-limit">
          Graph element limit
        </label>
        <input
          id="graph-limit"
          type="number"
          value={graphLimit}
          onChange={(e) => setGraphLimit(Number(e.target.value))}
          min={1}
          max={1000}
          placeholder="Limit"
          className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400"
          aria-label="Graph element limit"
        />
      </div>
    </div>
  );
}

