'use client';

import { Trash2 } from 'lucide-react';
import Button from '@/components/common/Button';
import { ontologyAPI } from '@/lib/api';
import { useToast } from '@/lib/hooks/useToast';
import type { TripleResponse } from '@/types/api';

interface TripleTableProps {
  triples: TripleResponse[];
  onDelete: () => void;
}

export default function TripleTable({ triples, onDelete }: TripleTableProps) {
  const { success, error } = useToast();

  const handleDelete = async (triple: TripleResponse) => {
    if (!confirm('Are you sure you want to delete this relationship?')) {
      return;
    }

    try {
      await ontologyAPI.deleteTriple({
        subject: triple.subject,
        predicate: triple.predicate,
        object: triple.object,
      });
      success('Relationship deleted successfully');
      onDelete();
    } catch (err) {
      error('Failed to delete relationship');
      console.error('Error:', err);
    }
  };

  if (triples.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">No relationships found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Predicate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Object
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {triples.map((triple, index) => (
              <tr key={`${triple.subject}-${triple.predicate}-${triple.object}-${index}`}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {triple.subject_label || triple.subject}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {triple.predicate}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {triple.object_label || triple.object}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Button
                    onClick={() => handleDelete(triple)}
                    variant="danger"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

