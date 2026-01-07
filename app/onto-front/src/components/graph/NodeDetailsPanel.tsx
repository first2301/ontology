'use client';

import { X } from 'lucide-react';
import { useGraphStore } from '@/lib/stores/graphStore';

export default function NodeDetailsPanel() {
  const { selectedNode, setSelectedNode } = useGraphStore();

  if (!selectedNode) return null;

  return (
    <div
      className="absolute right-4 top-4 w-64 rounded-lg border border-gray-200 bg-white shadow-lg"
      role="dialog"
      aria-labelledby="node-details-title"
      aria-modal="false"
    >
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h3 id="node-details-title" className="text-lg font-semibold">
          {selectedNode.label}
        </h3>
        <button
          onClick={() => setSelectedNode(null)}
          className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="Close node details"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="p-4">
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-medium text-gray-600">ID:</dt>
            <dd className="ml-2 text-gray-900">{selectedNode.id}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-600">Type:</dt>
            <dd className="ml-2 text-gray-900">{selectedNode.type}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-600">Label:</dt>
            <dd className="ml-2 text-gray-900">{selectedNode.label}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

