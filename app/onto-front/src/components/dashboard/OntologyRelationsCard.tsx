'use client';

import Link from 'next/link';
import { Link as LinkIcon, ArrowRight, Network } from 'lucide-react';
import type { TripleResponse } from '@/types/api';

interface OntologyRelationsCardProps {
  totalRelations: number;
  predicateStats: Array<{ predicate: string; count: number }>;
  triples: TripleResponse[];
}

/**
 * 온톨로지 관계 정보 요약 카드 컴포넌트
 * Dashboard에서 온톨로지 관계 정보를 요약하여 표시합니다.
 */
export default function OntologyRelationsCard({
  totalRelations,
  predicateStats,
  triples,
}: OntologyRelationsCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-100 p-2">
            <Network className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">온톨로지 관계 정보</h3>
        </div>
        <Link
          href="/relationship"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span>관계 편집</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {/* 총 관계 수 */}
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{totalRelations}</span>
            <span className="text-sm font-medium text-gray-600">개의 관계</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">현재 등록된 온톨로지 관계의 총 개수</p>
        </div>

        {/* 관계 타입별 통계 */}
        {predicateStats.length > 0 ? (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">주요 관계 타입</h4>
            <div className="space-y-2">
              {predicateStats.map(({ predicate, count }) => (
                <div
                  key={predicate}
                  className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{predicate}</span>
                  </div>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-500">등록된 관계가 없습니다</p>
            <Link
              href="/relationship"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              관계 추가하기
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

