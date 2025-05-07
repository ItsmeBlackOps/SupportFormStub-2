import { FormData } from './types';

export const INITIAL_FORM_DATA: FormData = {
  taskType: 'interview',
  name: '',
  gender: '',
  technology: '',
  email: '',
  phone: '',
  endClient: '',
  jobTitle: '',
  interviewRound: '',
  interviewDateTime: '',
  assessmentDeadline: '',
  availabilityDateTime: '',
  mockMode: undefined,
  remarks: '',
  duration: '60',
};

export const TASK_TYPE_COLORS = {
  interview: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: 'text-blue-500',
    hover: 'hover:bg-blue-50'
  },
  assessment: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    icon: 'text-purple-500',
    hover: 'hover:bg-purple-50'
  },
  mock: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: 'text-amber-500',
    hover: 'hover:bg-amber-50'
  },
  resumeUnderstanding: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: 'text-emerald-500',
    hover: 'hover:bg-emerald-50'
  },
  resumeReview: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: 'text-red-500',
    hover: 'hover:bg-red-50'
  }
};

export const TASK_TYPE_LABELS = {
  interview: 'Interview Support',
  assessment: 'Assessment Support',
  mock: 'Mock Interview',
  resumeUnderstanding: 'Resume Understanding',
  resumeReview: 'Resume Making'
};