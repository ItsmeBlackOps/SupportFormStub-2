import React from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Candidate } from '../types';

interface DetailModalProps {
  candidate: Candidate;
  onClose: () => void;
  formatDateTime: (dateTime?: string) => string;
  formatDate: (date?: string) => string;
}

export function DetailModal({
  candidate,
  onClose,
  formatDateTime,
  formatDate,
}: DetailModalProps) {
  const [copySuccess, setCopySuccess] = React.useState<'table' | 'subject' | null>(null);

  // Helper to capitalize first letter of each word
  const capitalizeWords = (str: string) => {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Generate title based on task type
  const getTitle = () => {
    const name = capitalizeWords(candidate.name);
    const tech = candidate.technology;

    switch (candidate.taskType) {
      case 'interview':
        return `Interview Support - ${name} - ${tech} - ${formatDateTime(candidate.interviewDateTime)}`;
      case 'assessment':
        return `Assessment Support - ${name} - ${tech} - ${formatDate(candidate.assessmentDeadline)}`;
      case 'mock':
        return `Mock Interview - ${name} - ${tech} - ${candidate.mockMode} - ${formatDateTime(candidate.availabilityDateTime)}`;
      case 'resumeUnderstanding':
        return `Resume Understanding - ${name} - ${tech} - ${formatDateTime(candidate.availabilityDateTime)}`;
      case 'resumeReview':
        return `Resume Making - ${name} - ${tech}`;
      default:
        return '';
    }
  };

  const rows: { label: string; value: string }[] = [
    { label: 'Candidate Name', value: capitalizeWords(candidate.name) },
    { label: 'Gender', value: candidate.gender },
    { label: 'Technology', value: candidate.technology },
  ];

  if (['interview', 'assessment', 'mock'].includes(candidate.taskType)) {
    rows.push({ label: 'End Client', value: candidate.endClient || '' });
  }

  switch (candidate.taskType) {
    case 'interview':
      rows.push(
        { label: 'Job Title in JD', value: candidate.jobTitle || '' },
        { label: 'Interview Round', value: candidate.interviewRound || '' },
        { label: 'Date and Time of Interview (EST)', value: formatDateTime(candidate.interviewDateTime) },
        { label: 'Duration', value: `${candidate.duration} minutes` }
      );
      break;
    case 'assessment':
      rows.push(
        { label: 'Assessment Deadline', value: formatDate(candidate.assessmentDeadline) },
        { label: 'Duration', value: `${candidate.duration} minutes` }
      );
      break;
    case 'mock':
      rows.push(
        { label: 'Mode', value: candidate.mockMode || '' },
        { label: 'Schedule', value: formatDateTime(candidate.availabilityDateTime) },
        { label: 'Notes', value: candidate.remarks || '' }
      );
      break;
    case 'resumeUnderstanding':
      rows.push(
        { label: 'Schedule', value: formatDateTime(candidate.availabilityDateTime) },
        { label: 'Notes', value: candidate.remarks || '' }
      );
      break;
    case 'resumeReview':
      rows.push({ label: 'Notes', value: candidate.remarks || '' });
      break;
  }

  rows.push(
    { label: 'Email ID', value: candidate.email },
    { label: 'Contact Number', value: candidate.phone }
  );

  const copyTableFormat = () => {
    const tableText = rows
      .map(({ label, value }) => `${label}\t${value || '-'}`)
      .join('\n');
    
    navigator.clipboard.writeText(tableText);
    setCopySuccess('table');
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const copySubjectFormat = () => {
    navigator.clipboard.writeText(getTitle());
    setCopySuccess('subject');
    setTimeout(() => setCopySuccess(null), 2000);
  };

  return (
    <div className="fixed inset-0 overflow-y-auto z-50 animate-fadeIn">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl 
                    transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={copySubjectFormat}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Copy Subject"
                >
                  {copySuccess === 'subject' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
                <h3 className="text-lg font-medium text-gray-900">{getTitle()}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Details Table */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center mb-2">
              <button
                onClick={copyTableFormat}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Copy Table Content"
              >
                {copySuccess === 'table' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            <table className="min-w-full border-collapse border border-black">
              <tbody>
                {rows.map(({ label, value }) => (
                  <tr key={label}>
                    <td className="border border-black p-1 font-semibold whitespace-nowrap">
                      {label}
                    </td>
                    <td className="border border-black p-1 whitespace-nowrap">
                      {value || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm 
                        font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}