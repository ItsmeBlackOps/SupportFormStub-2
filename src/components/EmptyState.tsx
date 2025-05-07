import React from 'react';
import { CalendarClock, Plus } from 'lucide-react';
import { Action } from '../types';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: Action;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title, 
  description, 
  action,
  icon = <CalendarClock className="h-12 w-12 text-indigo-400" aria-hidden="true" />
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-6 bg-white rounded-lg shadow-sm border border-gray-100 animate-fadeIn">
      <div className="flex justify-center">
        <div className="bg-indigo-50 p-3 rounded-full inline-flex">
          {icon}
        </div>
      </div>
      <h3 className="mt-3 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      
      {action && (
        <div className="mt-6">
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
                      rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                      transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}