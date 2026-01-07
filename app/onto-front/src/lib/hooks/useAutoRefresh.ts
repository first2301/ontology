'use client';

import { useEffect, useRef } from 'react';

interface UseAutoRefreshOptions {
  enabled: boolean;
  interval: number; // milliseconds
  onRefresh: () => void;
}

/**
 * 자동 새로고침 훅
 */
export function useAutoRefresh({ enabled, interval, onRefresh }: UseAutoRefreshOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(() => {
        onRefresh();
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, onRefresh]);
}

