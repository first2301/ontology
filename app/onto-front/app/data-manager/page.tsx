'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import FileUpload from '@/components/data-manager/FileUpload';
import UploadHistory from '@/components/data-manager/UploadHistory';
import type { UploadHistoryItem } from '@/types/manufacturing';

export default function DataManagerPage() {
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const queryClient = useQueryClient();

  const handleUploadSuccess = (item: UploadHistoryItem) => {
    setUploadHistory((prev) => [item, ...prev].slice(0, 50)); // 최대 50개 유지
  };

  const handleGraphRefresh = () => {
    // Graph 페이지의 쿼리 무효화하여 자동 새로고침
    queryClient.invalidateQueries({ queryKey: ['graph-elements'] });
    // Relationship 페이지도 새로고침
    queryClient.invalidateQueries({ queryKey: ['triples'] });
  };

  return (
    <MainLayout>
      <div className="flex h-full flex-col">
        <div className="border-b border-gray-200 bg-white p-4">
          <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <FileUpload onUploadSuccess={handleUploadSuccess} onGraphRefresh={handleGraphRefresh} />
            <UploadHistory history={uploadHistory} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

