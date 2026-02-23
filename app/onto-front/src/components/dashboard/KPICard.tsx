'use client';

import { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
}

export default function KPICard({ icon: Icon, title, value }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState<number>(typeof value === 'number' ? 0 : 0);

  // 숫자 값인 경우 카운트업 애니메이션
  useEffect(() => {
    if (typeof value === 'number') {
      setDisplayValue(0); // Reset when value changes
      const duration = 1000; // 1초
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(0);
    }
  }, [value]);

  const finalValue = typeof value === 'number' ? displayValue : value;

  return (
    <div
      className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-default"
    >
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-sm transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <div className="text-2xl font-bold text-gray-900 transition-all duration-300">
            {finalValue}
            {typeof value === 'number' && displayValue < value && (
              <span className="text-lg text-gray-400">...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

