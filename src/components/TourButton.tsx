import React from 'react';
import { HelpCircle, RotateCcw } from 'lucide-react';
import { useTour } from '../hooks/useTour';

interface TourButtonProps {
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const TourButton: React.FC<TourButtonProps> = ({ 
  variant = 'primary', 
  className = '' 
}) => {
  const { startMainTour, hasCompletedTour, resetTour } = useTour();

  const handleStartTour = () => {
    startMainTour();
  };

  const handleResetAndStartTour = () => {
    resetTour();
    setTimeout(() => {
      startMainTour();
    }, 100);
  };

  const isCompleted = hasCompletedTour();

  if (variant === 'secondary') {
    return (
      <button
        onClick={handleStartTour}
        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 
          hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200 ${className}`}
        title="Take a guided tour"
      >
        <HelpCircle className="h-4 w-4" />
        Guide Me
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleStartTour}
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm 
          font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 
          focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
        title="Take a guided tour of the application"
      >
        <HelpCircle className="h-4 w-4" />
        {isCompleted ? 'Retake Tour' : 'Take Tour'}
      </button>
      
      {isCompleted && (
        <button
          onClick={handleResetAndStartTour}
          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-500 
            hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
          title="Reset tour progress and start over"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      )}
    </div>
  );
};
