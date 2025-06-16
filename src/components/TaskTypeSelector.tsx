import { 
  CalendarRange, 
  ClipboardCheck, 
  UserCheck, 
  FileText, 
  FileEdit 
} from 'lucide-react';
import { TaskType } from '../types';
import { TASK_TYPE_LABELS } from '../constants';

interface TaskTypeSelectorProps {
  value: TaskType;
  onChange: (value: string) => void;
}

const taskTypeIcons = {
  interview: CalendarRange,
  assessment: ClipboardCheck,
  mock: UserCheck,
  resumeUnderstanding: FileText,
  resumeReview: FileEdit
};

export function TaskTypeSelector({ value, onChange }: TaskTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((type) => {
        const Icon = taskTypeIcons[type];
        const isSelected = value === type;
        
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`
              relative rounded-lg border border-gray-200 p-4 
              transition-all duration-200 ease-in-out
              ${isSelected 
                ? 'ring-2 ring-indigo-500 bg-indigo-50 border-indigo-200' 
                : 'hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex flex-col items-center text-center h-full">
              <div 
                className={`
                  p-2 rounded-full mb-3 
                  ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}
                `}
              >
                <Icon className="h-6 w-6" />
              </div>
              <span 
                className={`
                  text-sm font-medium 
                  ${isSelected ? 'text-indigo-700' : 'text-gray-900'}
                `}
              >
                {TASK_TYPE_LABELS[type]}
              </span>
            </div>
            
            {isSelected && (
              <span 
                className="absolute inset-0 rounded-lg ring-2 ring-indigo-500"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}