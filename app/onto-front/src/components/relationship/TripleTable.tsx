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
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
        <div className="mb-4 rounded-full bg-gray-100 p-4 inline-block">
          <Trash2 className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">No relationships found</p>
        <p className="mt-1 text-sm text-gray-500">Create a new relationship to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Subject
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Predicate
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Object
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {triples.map((triple, index) => (
              <tr 
                key={`${triple.subject}-${triple.predicate}-${triple.object}-${index}`}
                className="transition-colors hover:bg-blue-50/50"
              >
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {triple.subject_label || triple.subject}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {triple.predicate}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {triple.object_label || triple.object}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Button
                    onClick={() => handleDelete(triple)}
                    variant="danger"
                    size="sm"
                    className="opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete relationship</span>
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

