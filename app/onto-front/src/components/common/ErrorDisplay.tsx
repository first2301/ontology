'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';
import type { ApiError } from '@/lib/api/client';

interface ErrorDisplayProps {
  error: Error | unknown;
  onRetry?: () => void;
  title?: string;
}

export default function ErrorDisplay({ error, onRetry, title = 'Error' }: ErrorDisplayProps) {
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

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-4 text-sm text-gray-600">{errorMessage}</p>
      {statusCode && (
        <p className="mb-4 text-xs text-gray-500">Status Code: {statusCode}</p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="primary" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}

