'use client';

import type { UploadHistoryItem } from '@/types/manufacturing';

interface UploadHistoryProps {
  history: UploadHistoryItem[];
}

export default function UploadHistory({ history }: UploadHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">No upload history</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900">Upload History</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {history.map((item) => (
          <div key={item.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      item.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                  <span>{item.triplesLoaded} triples loaded</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

