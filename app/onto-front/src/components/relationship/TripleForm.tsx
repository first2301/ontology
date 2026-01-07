'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import { Plus, X } from 'lucide-react';
import { ontologyAPI } from '@/lib/api';
import { useToast } from '@/lib/hooks/useToast';
import type { Triple } from '@/types/api';
import { RELATIONSHIP_TYPES } from '@/lib/utils/constants';

interface TripleFormProps {
  onSuccess: () => void;
}

export default function TripleForm({ onSuccess }: TripleFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Triple>({
    subject: '',
    predicate: '',
    object: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.predicate || !formData.object) {
      error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await ontologyAPI.createTriple(formData);
      success('Relationship added successfully');
      setFormData({ subject: '', predicate: '', object: '' });
      setShowForm(false);
      onSuccess();
    } catch (err) {
      error('Failed to add relationship');
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} variant="primary">
        <Plus className="mr-2 h-4 w-4" />
        Add Relationship
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Add New Relationship</h3>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="triple-subject" className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <input
            id="triple-subject"
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="ex:Equipment001"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="triple-predicate" className="block text-sm font-medium text-gray-700">
            Predicate
          </label>
          <select
            id="triple-predicate"
            value={formData.predicate}
            onChange={(e) => setFormData({ ...formData, predicate: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
            aria-required="true"
          >
            <option value="">Select relationship type</option>
            {RELATIONSHIP_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="triple-object" className="block text-sm font-medium text-gray-700">
            Object
          </label>
          <input
            id="triple-object"
            type="text"
            value={formData.object}
            onChange={(e) => setFormData({ ...formData, object: e.target.value })}
            placeholder="ex:AreaA"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
            aria-required="true"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" variant="success" disabled={isSubmitting}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

