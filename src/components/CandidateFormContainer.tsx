import React from 'react';
import { Save } from 'lucide-react';
import { AutocompleteInput } from './AutocompleteInput';
import { FormSection } from './FormSection';
import { TaskTypeSelector } from './TaskTypeSelector';
import { FormData, AutocompleteData } from '../types';
import { TASK_TYPE_LABELS } from '../constants';

interface CandidateFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  autocompleteData: AutocompleteData;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
}

export default function CandidateFormContainer({
  formData,
  setFormData,
  autocompleteData,
  onSubmit,
  isEditing
}: CandidateFormProps) {
  const updateField = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };
  
  const handleTaskTypeChange = (taskType: string) => {
    setFormData({
      name: formData.name,
      gender: formData.gender,
      technology: formData.technology,
      email: formData.email,
      phone: formData.phone,
      endClient: ['interview', 'assessment', 'mock'].includes(taskType) ? formData.endClient : '',
      taskType: taskType as any,
      jobTitle: '',
      interviewRound: '',
      interviewDateTime: '',
      assessmentDeadline: '',
      availabilityDateTime: '',
      mockMode: undefined,
      remarks: '',
      duration: '60',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <form onSubmit={onSubmit} className="p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Update Candidate' : 'Add New Candidate'}
            </h2>
            
            <TaskTypeSelector 
              value={formData.taskType}
              onChange={handleTaskTypeChange}
            />
          </div>

          <div className="space-y-4">
            <AutocompleteInput
              id="name"
              label="Full Name"
              value={formData.name}
              options={[...autocompleteData.names]}
              onChange={(value) => updateField('name', value)}
              onOptionSelect={(value) => updateField('name', value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={formData.gender}
                  required
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <AutocompleteInput
                id="technology"
                label="Technology"
                value={formData.technology}
                options={[...autocompleteData.technologies]}
                onChange={(value) => updateField('technology', value)}
                onOptionSelect={(value) => updateField('technology', value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <AutocompleteInput
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                options={[...autocompleteData.emails]}
                onChange={(value) => updateField('email', value)}
                onOptionSelect={(value) => updateField('email', value)}
                required
              />

              <AutocompleteInput
                id="phone"
                label="Phone"
                type="tel"
                value={formData.phone}
                options={[...autocompleteData.phones]}
                onChange={(value) => updateField('phone', value)}
                onOptionSelect={(value) => updateField('phone', value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Task-specific fields */}
        <div className="border-t pt-4">
          {formData.taskType === 'interview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Job Title"
                value={formData.jobTitle || ''}
                onChange={(e) => updateField('jobTitle', e.target.value)}
                className="rounded-md border-gray-300 text-sm"
                required
              />
              <select
                value={formData.interviewRound || ''}
                onChange={(e) => updateField('interviewRound', e.target.value)}
                className="rounded-md border-gray-300 text-sm"
                required
              >
                <option value="">Select Round</option>
                <option value="Screening">Screening</option>
                <option value="1st">1st Round</option>
                <option value="2nd">2nd Round</option>
                <option value="3rd">3rd Round</option>
                <option value="Final">Final Round</option>
              </select>
              <input
                type="datetime-local"
                value={formData.interviewDateTime || ''}
                onChange={(e) => updateField('interviewDateTime', e.target.value)}
                className="rounded-md border-gray-300 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Client Company"
                value={formData.endClient || ''}
                onChange={(e) => updateField('endClient', e.target.value)}
                className="rounded-md border-gray-300 text-sm"
                required
              />
            </div>
          )}

          {formData.taskType === 'assessment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={formData.assessmentDeadline || ''}
                onChange={(e) => updateField('assessmentDeadline', e.target.value)}
                className="rounded-md border-gray-300 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Client Company"
                value={formData.endClient || ''}
                onChange={(e) => updateField('endClient', e.target.value)}
                className="rounded-md border-gray-300 text-sm"
                required
              />
            </div>
          )}

          {formData.taskType === 'mock' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="datetime-local"
                value={formData.availabilityDateTime || ''}
                onChange={(e) => updateField('availabilityDateTime', e.target.value)}
                className="rounded-md border-gray-300 text-sm"
                required
              />
              <select
                value={formData.mockMode || ''}
                onChange={(e) => updateField('mockMode', e.target.value as 'Evaluation' | 'Training')}
                className="rounded-md border-gray-300 text-sm"
                required
              >
                <option value="">Select Mode</option>
                <option value="Evaluation">Evaluation</option>
                <option value="Training">Training</option>
              </select>
              <input
                type="text"
                placeholder="Client Company"
                value={formData.endClient || ''}
                onChange={(e) => updateField('endClient', e.target.value)}
                className="rounded-md border-gray-300 text-sm"
                required
              />
              <textarea
                placeholder="Remarks"
                value={formData.remarks || ''}
                onChange={(e) => updateField('remarks', e.target.value)}
                className="rounded-md border-gray-300 text-sm"
                required
                rows={3}
              />
            </div>
          )}

          {['resumeUnderstanding', 'resumeReview'].includes(formData.taskType) && (
            <div className="grid grid-cols-1 gap-4">
              {formData.taskType === 'resumeUnderstanding' && (
                <input
                  type="datetime-local"
                  value={formData.availabilityDateTime || ''}
                  onChange={(e) => updateField('availabilityDateTime', e.target.value)}
                  className="rounded-md border-gray-300 text-sm"
                  required
                />
              )}
              <textarea
                placeholder="Remarks"
                value={formData.remarks || ''}
                onChange={(e) => updateField('remarks', e.target.value)}
                className="rounded-md border-gray-300 text-sm"
                required
                rows={3}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            <Save className="h-4 w-4" />
            {isEditing ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}