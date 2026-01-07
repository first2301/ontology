'use client';

import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
}

export default function KPICard({ icon: Icon, title, value }: KPICardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-blue-100 p-3">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  );
}

