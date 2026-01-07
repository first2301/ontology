'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload } from 'lucide-react';
import { ontologyAPI } from '@/lib/api';
import { useToast } from '@/lib/hooks/useToast';
import type { UploadHistoryItem } from '@/types/manufacturing';

interface FileUploadProps {
  onUploadSuccess: (item: UploadHistoryItem) => void;
  onGraphRefresh?: () => void;
}

export default function FileUpload({ onUploadSuccess, onGraphRefresh }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToast();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      if (file.name.endsWith('.ttl') || file.name.endsWith('.owl') || file.name.endsWith('.rdf')) {
        await uploadFile(file);
      } else {
        error(`Unsupported file type: ${file.name}`);
      }
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // 프로그레스 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const next = prev + Math.random() * 20;
          return next >= 100 ? 100 : next;
        });
      }, 200);

      // shapes.ttl은 빈 파일로 전송 (실제로는 서버에서 기본 shapes 사용)
      const shapesFile = new File([''], 'shapes.ttl', { type: 'text/turtle' });
      const response = await ontologyAPI.validateAndImport(file, shapesFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      const uploadItem: UploadHistoryItem = {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        status: response.validationConforms ? 'success' : 'error',
        triplesLoaded: response.triplesLoaded,
        timestamp: new Date().toLocaleString('ko-KR'),
      };

      onUploadSuccess(uploadItem);

      if (response.validationConforms) {
        success(`${response.triplesLoaded} triples loaded successfully`);
        // 그래프 자동 새로고침
        if (onGraphRefresh) {
          setTimeout(() => {
            onGraphRefresh();
          }, 500);
        }
      } else {
        error('Validation failed');
      }
    } catch (err) {
      error('Upload failed');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        role="button"
        tabIndex={0}
        aria-label="File upload area"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Upload Ontology Files
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop TTL files here or click to browse
        </p>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          multiple
          accept=".ttl,.owl,.rdf"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Select files to upload"
        >
          Select Files
        </button>
      </div>

      {uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Uploading...</span>
            <span className="font-medium text-gray-900">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

