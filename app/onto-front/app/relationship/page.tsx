'use client';

import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import TripleForm from '@/components/relationship/TripleForm';
import TripleTable from '@/components/relationship/TripleTable';
import Loading from '@/components/common/Loading';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import TableSkeleton from '@/components/common/TableSkeleton';
import Skeleton from '@/components/common/Skeleton';
import { ontologyAPI } from '@/lib/api';

export default function RelationshipPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['triples'],
    queryFn: () => ontologyAPI.getTriples(),
    retry: false,
  });

  const triples = data?.triples || [];

  return (
    <MainLayout>
      <div className="flex h-full flex-col">
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Relationship Editor</h2>
            <TripleForm onSuccess={() => refetch()} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="mx-auto max-w-6xl">
              <div className="mb-6">
                <Skeleton variant="text" width="200px" height={28} className="mb-4" />
                <TableSkeleton rows={5} columns={4} />
              </div>
            </div>
          ) : error ? (
            <ErrorDisplay error={error} onRetry={() => refetch()} title="Failed to load relationships" />
          ) : (
            <div className="mx-auto max-w-6xl">
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Existing Relationships
                </h3>
                <TripleTable triples={triples} onDelete={() => refetch()} />
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

