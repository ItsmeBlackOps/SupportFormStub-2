import React, { useState } from 'react';
import { Save, Code, Users, HelpCircle } from 'lucide-react';
import { AutocompleteInput } from './AutocompleteInput';
import { FormSection } from './FormSection';
import { TaskTypeSelector } from './TaskTypeSelector';
import { FormData, AutocompleteData, AssessmentType } from '../types';
import { TASK_TYPE_LABELS } from '../constants';
import { Modal } from './Modal';

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
  const [showAssessmentTypeModal, setShowAssessmentTypeModal] = useState(false);

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
      deadlineNotMentioned: false,
      assessmentType: undefined,
      screeningDone: false,
    });
  };

  const handleDeadlineNotMentioned = (checked: boolean) => {
    if (checked) {
      setShowAssessmentTypeModal(true);
    } else {
      updateField('deadlineNotMentioned', false);
      updateField('assessmentType', undefined);
      updateField('assessmentDeadline', '');
    }
  };

  const handleAssessmentTypeSelect = (type: AssessmentType) => {
    const now = new Date();
    const deadline = new Date(now);
    
    // Set timezone to New York
    const nyTime = now.toLocaleString("en-US", { timeZone: "America/New_York" });
    const nyDate = new Date(nyTime);
    
    // Add days based on type
    if (type === 1) { // Non-Technical
      deadline.setDate(nyDate.getDate() + 3);
    } else { // Technical or Unknown
      deadline.setDate(nyDate.getDate() + 7);
    }

    updateField('deadlineNotMentioned', true);
    updateField('assessmentType', type);
    updateField('assessmentDeadline', deadline.toISOString().split('T')[0]);
    setShowAssessmentTypeModal(false);
  };

  const handleScreeningDone = (checked: boolean) => {
    if (checked) {
      const deadline = new Date();
      const nyTime = deadline.toLocaleString("en-US", { timeZone: "America/New_York" });
      const nyDate = new Date(nyTime);
      deadline.setDate(nyDate.getDate() + 3);
      updateField('assessmentDeadline', deadline.toISOString().split('T')[0]);
    }
    updateField('screeningDone', checked);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <form onSubmit={onSubmit} className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {(Object.keys(TASK_TYPE_LABELS) as Array<keyof typeof TASK_TYPE_LABELS>).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTaskTypeChange(type)}
                className={`
                  relative rounded-lg p-3 text-center transition-all duration-200
                  ${formData.taskType === type 
                    ? 'bg-indigo-50 border-2 border-indigo-500 text-indigo-700' 
                    : 'border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-sm font-medium">{TASK_TYPE_LABELS[type]}</span>
              </button>
            ))}
          </div>

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

          {formData.taskType === 'interview' && (
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
          )}

          {formData.taskType === 'assessment' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="deadlineNotMentioned"
                    checked={formData.deadlineNotMentioned}
                    onChange={(e) => handleDeadlineNotMentioned(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="deadlineNotMentioned" className="text-sm font-medium text-gray-700">
                    Deadline Not Mentioned
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="screeningDone"
                    checked={formData.screeningDone}
                    onChange={(e) => handleScreeningDone(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="screeningDone" className="text-sm font-medium text-gray-700">
                    Screening Done
                  </label>
                </div>

                {!formData.deadlineNotMentioned && (
                  <div>
                    <label htmlFor="assessmentDeadline" className="block text-sm font-medium text-gray-700">
                      Assessment Deadline (EDT)
                    </label>
                    <input
                      type="date"
                      id="assessmentDeadline"
                      value={formData.assessmentDeadline || ''}
                      required={!formData.deadlineNotMentioned}
                      onChange={(e) => updateField('assessmentDeadline', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                        focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                        transition-colors duration-200"
                    />
                  </div>
                )}
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
          )}

          {formData.taskType === 'mock' && (
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
          )}

          {formData.taskType === 'resumeUnderstanding' && (
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
          )}

          {formData.taskType === 'resumeReview' && (
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
          )}
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 rounded-md bg-indigo-600 px-4 py-2
                      text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none 
                      focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <Save className="h-4 w-4" />
            {isEditing ? 'Update Candidate' : 'Save Candidate'}
          </button>
        </div>
      </form>

      <Modal
        isOpen={showAssessmentTypeModal}
        onClose={() => {
          setShowAssessmentTypeModal(false);
          updateField('deadlineNotMentioned', false);
        }}
        title="Select Assessment Type"
      >
        <div className="space-y-4">
          <button
            onClick={() => handleAssessmentTypeSelect(0)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Code className="h-5 w-5 text-indigo-500" />
            <div className="text-left">
              <div className="font-medium">Technical</div>
              <div className="text-sm text-gray-500">7 days deadline</div>
            </div>
          </button>
          <button
            onClick={() => handleAssessmentTypeSelect(1)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Users className="h-5 w-5 text-green-500" />
            <div className="text-left">
              <div className="font-medium">Non-Technical</div>
              <div className="text-sm text-gray-500">3 days deadline</div>
            </div>
          </button>
          <button
            onClick={() => handleAssessmentTypeSelect(2)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <HelpCircle className="h-5 w-5 text-amber-500" />
            <div className="text-left">
              <div className="font-medium">Unknown</div>
              <div className="text-sm text-gray-500">7 days deadline</div>
            </div>
          </button>
        </div>
      </Modal>
    </div>
  );
}