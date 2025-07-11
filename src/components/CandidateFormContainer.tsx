import React, { useState } from 'react';
import { Save, AlertTriangle } from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { AutocompleteInput } from './AutocompleteInput';
import { FormData, AutocompleteData, TaskType } from '../types';
import { TASK_TYPE_LABELS } from '../constants';

// Initialize dayjs plugins
dayjs.extend(customParseFormat);

interface CandidateFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [timeWarning, setTimeWarning] = useState<string | null>(null);

  const capitalizeWords = (str: string) => {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'email':
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'technology':
        if (!/^[a-zA-Z0-9\s/.+#-]+$/.test(value)) {
          return 'Technology can only contain letters, numbers, spaces, and basic punctuation';
        }
        break;
      case 'endClient':
        if (value && !/^[a-zA-Z0-9\s&.,'-]+$/.test(value)) {
          return 'Company name can only contain letters, numbers, spaces, and basic punctuation';
        }
        break;
      case 'jobTitle':
        if (value && !/^[a-zA-Z0-9\s&.,'-]+$/.test(value)) {
          return 'Job title can only contain letters, numbers, spaces, and basic punctuation';
        }
        break;
    }
    return '';
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except '+'
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // If no '+' prefix, add '+1'
    if (!cleaned.startsWith('+')) {
      cleaned = '+1' + cleaned;
    }
    
    // Get all digits after the '+'
    const digits = cleaned.slice(1);
    
    // Format the number if we have enough digits
    if (digits.length >= 10) {
      const country = digits.slice(0, digits.length - 10);
      const area = digits.slice(-10, -7);
      const prefix = digits.slice(-7, -4);
      const line = digits.slice(-4);
      
      return `+${country} (${area}) ${prefix}-${line}`;
    }
    
    return cleaned;
  };

  const handleDateTimeChange = (newValue: dayjs.Dayjs | null, field: 'interviewDateTime' | 'availabilityDateTime') => {
    if (newValue) {
      const hour = newValue.hour();
      
      // Check if time is outside business hours (9 AM - 6 PM)
      if (hour < 9 || hour >= 18) {
        const warning = "Warning: The selected time is outside of business hours (9 AM - 6 PM)";
        setTimeWarning(warning);
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            message: warning,
            type: 'warning'
          }
        }));
      } else {
        setTimeWarning(null);
      }

      // Store the exact date and time without any timezone conversion
      const formattedDateTime = newValue.format('YYYY-MM-DDTHH:mm:ss');
      updateField(field, formattedDateTime);
    } else {
      updateField(field, '');
    }
  };

  const updateField = (field: keyof FormData, value: string | boolean) => {
    let processedValue: string | boolean = value;
    
    if (typeof value === 'string') {
      if (['technology', 'endClient', 'jobTitle'].includes(field)) {
        processedValue = capitalizeWords(value);
      }

      if (field === 'phone') {
        processedValue = formatPhoneNumber(value);
      }

      if (['email', 'technology', 'endClient', 'jobTitle'].includes(field)) {
        const error = validateField(field, value);
        setErrors(prev => ({
          ...prev,
          [field]: error
        }));
      }
    }

    setFormData((prev: FormData) => ({ ...prev, [field]: processedValue }));
  };

  const handleTaskTypeChange = (taskType: string) => {
    const newFormData: FormData = {
      name: formData.name,
      gender: formData.gender,
      technology: formData.technology,
      email: formData.email,
      phone: formData.phone,
      endClient: ['interview', 'assessment', 'mock'].includes(taskType) ? formData.endClient : '',
      taskType: taskType as TaskType,
      jobTitle: '',
      interviewRound: '',
      interviewDateTime: '',
      assessmentDeadline: '',
      availabilityDateTime: '',
      mockMode: undefined,
      remarks: '',
      duration: '60',
      screeningDone: false,
      expert: formData.expert,
    };
    setFormData(newFormData);
    setErrors({});
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    newErrors.email = validateField('email', formData.email);
    newErrors.technology = validateField('technology', formData.technology);
    
    if (['interview', 'assessment', 'mock'].includes(formData.taskType) && formData.endClient) {
      newErrors.endClient = validateField('endClient', formData.endClient);
    }
    
    if (formData.taskType === 'interview' && formData.jobTitle) {
      newErrors.jobTitle = validateField('jobTitle', formData.jobTitle);
    }
    
    const finalErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([, value]) => value !== '')
    );
    
    setErrors(finalErrors);
    
    if (Object.keys(finalErrors).length === 0) {
      onSubmit(e);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" data-tour="task-type-selector">
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

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2" data-tour="candidate-info">
              <AutocompleteInput
                id="name"
                label="Full Name"
                value={formData.name}
                options={[...autocompleteData.names]}
                onChange={(value) => updateField('name', capitalizeWords(value))}
                onOptionSelect={(value) => updateField('name', capitalizeWords(value))}
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

              <div className="relative" data-tour="technology-field">
                <AutocompleteInput
                  id="technology"
                  label="Technology / Skill"
                  value={formData.technology}
                  options={[...autocompleteData.technologies]}
                  onChange={(value) => updateField('technology', value)}
                  onOptionSelect={(value) => updateField('technology', value)}
                  required
                />
                {errors.technology && (
                  <p className="mt-1 text-sm text-red-600">{errors.technology}</p>
                )}
              </div>

              <div className="relative">
                <AutocompleteInput
                  id="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  options={[...autocompleteData.emails]}
                  onChange={(value) => updateField('email', value)}
                  onOptionSelect={(value) => updateField('email', value)}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div data-tour="phone-field">
                <AutocompleteInput
                  id="phone"
                  label="Contact Number"
                  type="tel"
                  value={formData.phone}
                  options={[...autocompleteData.phones]}
                  onChange={(value) => updateField('phone', value)}
                  onOptionSelect={(value) => updateField('phone', value)}
                  onBlur={(e) => updateField('phone', e.target.value)}
                  required
                />
              </div>

              {['interview', 'assessment', 'mock'].includes(formData.taskType) && (
                <div className="relative">
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
                  {errors.endClient && (
                    <p className="mt-1 text-sm text-red-600">{errors.endClient}</p>
                  )}
                </div>
              )}
            </div>

            {formData.taskType === 'interview' && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2" data-tour="dynamic-fields">
                <div className="relative">
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
                  {errors.jobTitle && (
                    <p className="mt-1 text-sm text-red-600">{errors.jobTitle}</p>
                  )}
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
                    <option value="On-Demand AI Interview">On Demand or AI Interviews</option>
                    <option value="1st">1st Round</option>
                    <option value="2nd">2nd Round</option>
                    <option value="3rd">3rd Round</option>
                    <option value="4th">4th Round</option>
                    <option value="5th">5th Round</option>
                    <option value="Technical">Technical Round</option>
                    <option value="Coding">Coding Round</option>
                    <option value="Loop">Loop Round</option>
                    <option value="Final">Final Round</option>
                  </select>
                </div>

                <div data-tour="datetime-picker">
                  <label className="block text-sm font-medium text-gray-700">
                    Interview Date &amp; Time (EDT)
                  </label>
                  <DateTimePicker
                    value={formData.interviewDateTime ? dayjs(formData.interviewDateTime) : null}
                    onChange={(newValue) => handleDateTimeChange(newValue, 'interviewDateTime')}
                    format="MM/DD/YYYY hh:mm A"
                    className="mt-1 block w-full"
                    slotProps={{
                      textField: {
                        required: true,
                        className: "w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      }
                    }}
                  />
                  {timeWarning && (
                    <div className="mt-2 flex items-center gap-2 text-amber-600" data-tour="time-warning">
                      <AlertTriangle className="h-4 w-4" />
                      <p className="text-sm">{timeWarning}</p>
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

            {formData.taskType === 'assessment' && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700">
                    Availability (Date &amp; Time) (EDT)
                  </label>
                  <DateTimePicker
                    value={formData.availabilityDateTime ? dayjs(formData.availabilityDateTime) : null}
                    onChange={(newValue) => handleDateTimeChange(newValue, 'availabilityDateTime')}
                    format="MM/DD/YYYY hh:mm A"
                    className="mt-1 block w-full"
                    slotProps={{
                      textField: {
                        required: true,
                        className: "w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      }
                    }}
                  />
                  {timeWarning && (
                    <div className="mt-2 flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <p className="text-sm">{timeWarning}</p>
                    </div>
                  )}
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
                  <label className="block text-sm font-medium text-gray-700">
                    Availability (Date &amp; Time) (EDT)
                  </label>
                  <DateTimePicker
                    value={formData.availabilityDateTime ? dayjs(formData.availabilityDateTime) : null}
                    onChange={(newValue) => handleDateTimeChange(newValue, 'availabilityDateTime')}
                    format="MM/DD/YYYY hh:mm A"
                    className="mt-1 block w-full"
                    slotProps={{
                      textField: {
                        required: true,
                        className: "w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      }
                    }}
                  />
                  {timeWarning && (
                    <div className="mt-2 flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <p className="text-sm">{timeWarning}</p>
                    </div>
                  )}
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
              data-tour="submit-button"
              className="w-full flex justify-center items-center gap-2 rounded-md bg-indigo-600 px-4 py-2
                        text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none 
                        focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <Save className="h-4 w-4" />
              {isEditing ? 'Update Candidate' : 'Save Candidate'}
            </button>
          </div>
        </form>
      </div>
    </LocalizationProvider>
  );
}
