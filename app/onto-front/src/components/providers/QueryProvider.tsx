'use client';

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import type { ApiError } from '@/lib/api/client';

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            // 전역 쿼리 에러 로깅
            if (error instanceof Error && 'status' in error) {
              const apiError = error as ApiError;
              console.error(`API Error [${apiError.status}]:`, apiError.message);
              if (apiError.details) {
                console.error('Error details:', apiError.details);
              }
            } else if (error instanceof Error) {
              // 네트워크 에러 등
              console.error('Network or unknown error:', error.message);
            } else {
              console.error('Unknown error:', error);
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            // Mutation 에러 로깅
            if (error instanceof Error && 'status' in error) {
              const apiError = error as ApiError;
              console.error(`Mutation Error [${apiError.status}]:`, apiError.message);
            } else {
              console.error('Mutation error:', error);
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // ApiError인 경우 상태 코드에 따라 재시도 결정
              if (error instanceof Error && 'status' in error) {
                const apiError = error as ApiError;
                // 4xx 에러는 재시도하지 않음
                if (apiError.status >= 400 && apiError.status < 500) {
                  return false;
                }
                // 네트워크 에러 (status 0)는 재시도
                if (apiError.status === 0) {
                  return failureCount < 3;
                }
              }
              // 5xx 에러는 최대 2번 재시도
              return failureCount < 2;
            },
          },
          mutations: {
            retry: (failureCount, error) => {
              // Mutation은 4xx 에러는 재시도하지 않음
              if (error instanceof Error && 'status' in error) {
                const apiError = error as ApiError;
                if (apiError.status >= 400 && apiError.status < 500) {
                  return false;
                }
              }
              return failureCount < 1; // Mutation은 최대 1번만 재시도
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

