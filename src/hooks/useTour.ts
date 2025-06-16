import { useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export interface TourStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: 'left' | 'right' | 'top' | 'bottom';
    align?: 'start' | 'center' | 'end';
  };
}

export const useTour = () => {
  const createTour = useCallback((steps: TourStep[]) => {
    return driver({
      showProgress: true,
      steps: steps,
      nextBtnText: 'Next →',
      prevBtnText: '← Previous',
      doneBtnText: 'Finish Tour',
      progressText: 'Step {{current}} of {{total}}',
      showButtons: ['next', 'previous', 'close'],
      popoverClass: 'driverjs-theme',
      popoverOffset: 10,
      smoothScroll: true,
      allowClose: true,
      stagePadding: 4,
      onDestroyed: () => {
        // Mark tour as completed
        localStorage.setItem('supportFormTourCompleted', 'true');
      }
    });
  }, []);

  const startMainTour = useCallback(() => {
    const steps: TourStep[] = [
      {
        element: 'body',
        popover: {
          title: 'Welcome to Support Form!',
          description: 'This guided tour will help you understand how to properly use this application to manage candidate support requests.',
          side: 'bottom'
        }
      },
      {
        element: '[data-tour="task-type-selector"]',
        popover: {
          title: 'Select Task Type',
          description: 'Start by selecting the type of support needed: Interview Support, Assessment Support, Mock Interview, Resume Understanding, or Resume Making. Each type has specific requirements.',
          side: 'bottom'
        }
      },
      {
        element: '[data-tour="candidate-info"]',
        popover: {
          title: 'Candidate Information',
          description: 'Fill in the candidate\'s basic information. All fields marked as required must be completed. The system will validate email format and other inputs automatically.',
          side: 'top'
        }
      },
      {
        element: '[data-tour="technology-field"]',
        popover: {
          title: 'Technology/Skill Field',
          description: 'Specify the technology or skill area. This field only accepts letters, numbers, spaces, and basic punctuation. The system will auto-capitalize words for consistency.',
          side: 'bottom'
        }
      },
      {
        element: '[data-tour="phone-field"]',
        popover: {
          title: 'Phone Number Format',
          description: 'Enter the phone number. The system will automatically format it as +1 (XXX) XXX-XXXX. If no country code is provided, +1 will be added automatically.',
          side: 'bottom'
        }
      },
      {
        element: '[data-tour="dynamic-fields"]',
        popover: {
          title: 'Dynamic Form Fields',
          description: 'Based on your task type selection, additional relevant fields will appear here. For interviews, you\'ll see date/time pickers with business hours validation.',
          side: 'top'
        }
      },
      {
        element: '[data-tour="submit-button"]',
        popover: {
          title: 'Save Candidate',
          description: 'Click here to save the candidate information. The system will validate all fields before submission and show any errors that need to be corrected.',
          side: 'top'
        }
      },
      {
        element: '[data-tour="scheduled-tab"], button[data-tour="scheduled-tab"]',
        popover: {
          title: 'View Scheduled Candidates',
          description: 'Switch to this tab to view all scheduled candidates. You can edit, clone, or delete existing entries from the timeline view. This completes our tour!',
          side: 'bottom'
        }
      }
    ];

    // Create tour and start it
    const tour = createTour(steps);
    tour.drive();
  }, [createTour]);

  const startBusinessHoursTour = useCallback(() => {
    const steps: TourStep[] = [
      {
        element: '[data-tour="datetime-picker"]',
        popover: {
          title: 'Business Hours Validation',
          description: 'When selecting interview times, the system validates business hours (9 AM - 6 PM). You\'ll receive a warning for times outside these hours.',
          side: 'bottom'
        }
      },
      {
        element: '[data-tour="time-warning"]',
        popover: {
          title: 'Time Warning System',
          description: 'If you select a time outside business hours, a warning will appear here and as a toast notification.',
          side: 'top'
        }
      }
    ];

    const tour = createTour(steps);
    tour.drive();
  }, [createTour]);

  const hasCompletedTour = useCallback(() => {
    return localStorage.getItem('supportFormTourCompleted') === 'true';
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem('supportFormTourCompleted');
  }, []);

  return {
    startMainTour,
    startBusinessHoursTour,
    hasCompletedTour,
    resetTour
  };
};
