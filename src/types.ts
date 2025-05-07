export type TaskType = 
  | 'interview'
  | 'assessment'
  | 'mock'
  | 'resumeUnderstanding'
  | 'resumeReview';

export type TabId = 'new' | 'scheduled';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * FormData represents the fields captured by the CandidateForm.
 * Fields marked optional (?) are only required for specific task types.
 */
export interface FormData {
  taskType: TaskType;
  name: string;
  gender: string;
  technology: string;
  email: string;
  phone: string;
  
  // Fields for interview and assessment
  endClient?: string;
  duration?: string;
  
  // Interview-specific fields
  interviewRound?: string;
  jobTitle?: string;
  interviewDateTime?: string;
  
  // Assessment-specific field
  assessmentDeadline?: string;
  
  // Mock interview fields
  availabilityDateTime?: string;
  mockMode?: 'Evaluation' | 'Training';
  
  // Common optional field for remarks
  remarks?: string;
}

/**
 * Candidate extends FormData with a unique identifier and timestamps.
 */
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
  icon?: React.ComponentType<any>;
}