export type TaskType = 
  | 'interview'
  | 'assessment'
  | 'mock'
  | 'resumeUnderstanding'
  | 'resumeReview';

export type TabId = 'new' | 'scheduled';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface FormData {
  taskType: TaskType;
  name: string;
  gender: string;
  technology: string;
  email: string;
  phone: string;
  expert?: string;
  status?: string;
  subject?: string;
  
  // Fields for interview and assessment
  endClient?: string;
  duration?: string;
  
  // Interview-specific fields
  interviewRound?: string;
  jobTitle?: string;
  interviewDateTime?: string;
  
  // Assessment-specific fields
  assessmentDeadline?: string;
  screeningDone?: boolean;
  
  // Mock interview fields
  availabilityDateTime?: string;
  mockMode?: 'Evaluation' | 'Training';
  
  // Common optional field for remarks
  remarks?: string;
}

export interface Candidate extends FormData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutocompleteData {
  names: Set<string>;
  genders: Set<string>;
  technologies: Set<string>;
  emails: Set<string>;
  phones: Set<string>;
}

export interface Action {
  label: string;
  onClick: () => void;
}