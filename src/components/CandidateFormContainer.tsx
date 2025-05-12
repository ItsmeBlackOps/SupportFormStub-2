import React from 'react';
import { Save, ImagePlus } from 'lucide-react';
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
    <div className="bg-white shadow-sm rounded-lg overflow-hidden transition-all duration-300 animate-fadeIn">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Update Candidate' : 'Add New Candidate'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {TASK_TYPE_LABELS[formData.taskType]} details
            </p>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
            <ImagePlus className="h-4 w-4 mr-1.5 text-gray-400" />
            <span>Paste image to auto-fill</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={onSubmit} className="p-6">
        <div className="space-y-8">
          <FormSection title="Task Type">
            <TaskTypeSelector 
              value={formData.taskType}
              onChange={handleTaskTypeChange}
            />
          </FormSection>
          
          <FormSection title="Candidate Information">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <AutocompleteInput
                id="name"
                label="Full Name"
                value={formData.name}
                options={[...autocompleteData.names]}
                onChange={(value) => updateField('name', value)}
                onOptionSelect={(value) => updateField('name', value)}
                required
              />

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  required
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                    focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 
                    transition-colors duration-200"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <AutocompleteInput
                id="technology"
                label="Technology / Skill"
                value={formData.technology}
                options={[...autocompleteData.technologies]}
                onChange={(value) => updateField('technology', value)}
                onOptionSelect={(value) => updateField('technology', value)}
                required
              />

              <AutocompleteInput
                id="email"
                label="Email Address"
                type="email"
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                value={formData.email}
                options={[...autocompleteData.emails]}
                onChange={(value) => updateField('email', value)}
                onOptionSelect={(value) => updateField('email', value)}
                required
              />

              <AutocompleteInput
                id="phone"
                label="Contact Number"
                type="tel"
                pattern="[0-9\s-()]+"
                value={formData.phone}
                options={[...autocompleteData.phones]}
                onChange={(value) => updateField('phone', value)}
                onOptionSelect={(value) => updateField('phone', value)}
                required
              />

              {['interview', 'assessment', 'mock'].includes(formData.taskType) && (
                <div>
                  <label htmlFor="endClient" className="block text-sm font-medium text-gray-700">
                    Client Company
                  </label>
                  <input
                    type="text"
                    id="endClient"
                    value={formData.endClient || ''}
                    required
                    onChange={(e) => updateField('endClient', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                      focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                      transition-colors duration-200"
                  />
                </div>
              )}
            </div>
          </FormSection>
          
          {formData.taskType === 'interview' && (
            <FormSection title="Interview Details">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    value={formData.jobTitle || ''}
                    required
                    onChange={(e) => updateField('jobTitle', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                      focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                      transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="interviewRound" className="block text-sm font-medium text-gray-700">
                    Interview Round
                  </label>
                  <select
                    id="interviewRound"
                    value={formData.interviewRound || ''}
                    required
                    onChange={(e) => updateField('interviewRound', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                      focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                      transition-colors duration-200"
                  >
                    <option value="">Select Round</option>
                    <option value="Screening">Screening</option>
                    <option value="1st">1st Round</option>
                    <option value="2nd">2nd Round</option>
                    <option value="3rd">3rd Round</option>
                    <option value="Final">Final Round</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="interviewDateTime" className="block text-sm font-medium text-gray-700">
                    Interview Date &amp; Time (EDT)
                  </label>
                  <input
                    type="datetime-local"
                    id="interviewDateTime"
                    value={formData.interviewDateTime || ''}
                    required
                    onChange={(e) => updateField('interviewDateTime', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                      focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                      transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    value={formData.duration || ''}
                    required
                    min={15}
                    max={180}
                    onChange={(e) => updateField('duration', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                      focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                      transition-colors duration-200"
                  />
                </div>
              </div>
            </FormSection>
          )}

          {formData.taskType === 'assessment' && (
            <FormSection title="Assessment Details">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="assessmentDeadline" className="block text-sm font-medium text-gray-700">
                    Assessment Deadline (EDT)
                  </label>
                  <input
                    type="date"
                    id="assessmentDeadline"
                    value={formData.assessmentDeadline || ''}
                    required
                    onChange={(e) => updateField('assessmentDeadline', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                      focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                      transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    value={formData.duration || ''}
                    required
                    min={15}
                    max={180}
                    onChange={(e) => updateField('duration', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                      focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                      transition-colors duration-200"
                  />
                </div>
              </div>
            </FormSection>
          )}

          {formData.taskType === 'mock' && (
            <FormSection title="Mock Interview Details">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="availabilityDateTime" className="block text-sm font-medium text-gray-700">
                    Availability (Date &amp; Time) (EDT)
                  </label>
                  <input
                    type="datetime-local"
                    id="availabilityDateTime"
                    value={formData.availabilityDateTime || ''}
                    required
                    onChange={(e) => updateField('availabilityDateTime', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                      focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                      transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="mockMode" className="block text-sm font-medium text-gray-700">
                    Mode
                  </label>
                  <select
                    id="mockMode"
                    value={formData.mockMode || ''}
                    required
                    onChange={(e) => updateField('mockMode', e.target.value as 'Evaluation' | 'Training')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                      focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                      transition-colors duration-200"
                  >
                    <option value="">Select Mode</option>
                    <option value="Evaluation">Evaluation</option>
                    <option value="Training">Training</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                    Remarks
                  </label>
                  <textarea
                    id="remarks"
                    value={formData.remarks || ''}
                    required
                    onChange={(e) => updateField('remarks', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                      focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                      transition-colors duration-200"
                  />
                </div>
              </div>
            </FormSection>
          )}

          {formData.taskType === 'resumeUnderstanding' && (
            <FormSection title="Resume Understanding Details">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="availabilityDateTime" className="block text-sm font-medium text-gray-700">
                    Availability (Date &amp; Time) (EDT)
                  </label>
                  <input
                    type="datetime-local"
                    id="availabilityDateTime"
                    value={formData.availabilityDateTime || ''}
                    required
                    onChange={(e) => updateField('availabilityDateTime', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                      focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                      transition-colors duration-200"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                    Remarks
                  </label>
                  <textarea
                    id="remarks"
                    value={formData.remarks || ''}
                    required
                    onChange={(e) => updateField('remarks', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                      focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                      transition-colors duration-200"
                  />
                </div>
              </div>
            </FormSection>
          )}

          {formData.taskType === 'resumeReview' && (
            <FormSection title="Resume Making Details">
              <div>
                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                  Remarks
                </label>
                <textarea
                  id="remarks"
                  value={formData.remarks || ''}
                  required
                  onChange={(e) => updateField('remarks', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                    focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                    transition-colors duration-200"
                />
              </div>
            </FormSection>
          )}
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="group relative w-full flex justify-center items-center gap-2 rounded-md
                      bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm 
                      hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500
                      focus:ring-offset-2 transition-colors duration-200"
          >
            <Save className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            <span className="group-hover:translate-x-0.5 transition-transform duration-200">
              {isEditing ? 'Update Candidate' : 'Save Candidate'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}