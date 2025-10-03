import { FormData } from './types';

export const INITIAL_FORM_DATA: FormData = {
  taskType: 'assessment',
  name: '',
  gender: '',
  technology: '',
  email: '',
  phone: '',
  endClient: '',
  assessmentDeadline: '',
  availabilityDateTime: '',
  mockMode: undefined,
  remarks: '',
  duration: '60',
  expert: '',
};

export const TASK_TYPE_COLORS = {
  assessment: {
    bg: 'bg-accent-100',
    text: 'text-accent-800',
    border: 'border-accent-200',
    icon: 'text-accent-600',
    hover: 'hover:bg-accent-50'
  },
  mock: {
    bg: 'bg-primary-100',
    text: 'text-primary-800',
    border: 'border-primary-200',
    icon: 'text-primary-600',
    hover: 'hover:bg-primary-50'
  },
  resumeUnderstanding: {
    bg: 'bg-accent-100',
    text: 'text-accent-800',
    border: 'border-accent-200',
    icon: 'text-accent-600',
    hover: 'hover:bg-accent-50'
  },
  resumeReview: {
    bg: 'bg-primary-100',
    text: 'text-primary-800',
    border: 'border-primary-200',
    icon: 'text-primary-600',
    hover: 'hover:bg-primary-50'
  }
};

export const TASK_TYPE_LABELS = {
  assessment: 'Assessment Support',
  mock: 'Mock Interview',
  resumeUnderstanding: 'Resume Understanding',
  resumeReview: 'Resume Making'
};