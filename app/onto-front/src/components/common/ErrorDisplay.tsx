'use client';

import { AlertCircle, RefreshCw, FileX } from 'lucide-react';
import Button from './Button';
import type { ApiError } from '@/lib/api/client';

interface ErrorDisplayProps {
  error: Error | unknown;
  onRetry?: () => void;
  title?: string;
  emptyState?: boolean;
  emptyMessage?: string;
}

export default function ErrorDisplay({ 
  error, 
  onRetry, 
  title = 'Error',
  emptyState = false,
  emptyMessage
}: ErrorDisplayProps) {
  let errorMessage = 'An unexpected error occurred';
  let statusCode: number | null = null;

  if (error instanceof Error) {
    if ('status' in error) {
      const apiError = error as ApiError;
      errorMessage = apiError.message || `HTTP ${apiError.status}: ${apiError.statusText}`;
      statusCode = apiError.status;
    } else {
      errorMessage = error.message;
    }
  }

  if (emptyState) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-4">
          <FileX className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mb-6 text-sm text-gray-600 max-w-md">
          {emptyMessage || 'No data available at the moment.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-4">
        <AlertCircle className="h-10 w-10 text-red-600" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-2 text-sm text-gray-600 max-w-md">{errorMessage}</p>
      {statusCode && (
        <p className="mb-6 text-xs text-gray-500">Status Code: {statusCode}</p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="primary" size="md" className="mt-2">
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </Button>
      )}
    </div>
  );
}

