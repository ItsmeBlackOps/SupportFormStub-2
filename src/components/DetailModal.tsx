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
        { label: 'Job Title', value: candidate.jobTitle || '' },
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
      if (candidate.screeningDone) {
        rows.push({ label: 'Screening Status', value: 'Done' });
      }
      break;
    case 'mock':
      rows.push(
        { label: 'Mode', value: candidate.mockMode || '' },
        { label: 'Schedule', value: formatDateTime(candidate.availabilityDateTime) }
      );
      break;
    case 'resumeUnderstanding':
      rows.push(
        { label: 'Schedule', value: formatDateTime(candidate.availabilityDateTime) }
      );
      break;
  }

  rows.push(
    { label: 'Email ID', value: candidate.email },
    { label: 'Contact Number', value: candidate.phone }
  );

  const copyTableFormat = () => {
    const tempDiv = document.createElement('div');
    
    // Add GIF image if screening is done for assessment
    if (candidate.taskType === 'assessment' && candidate.screeningDone) {
      const img = document.createElement('img');
      img.src = 'https://media.tenor.com/yhAAYQqxbcgAAAAi/little-pills.gif';
      img.alt = 'Screening Done';
      img.style.width = '32px';
      img.style.height = '32px';
      img.style.marginBottom = '16px';
      tempDiv.appendChild(img);
    }

    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = 'auto';

    rows.forEach(({ label, value }) => {
      const tr = document.createElement('tr');
      const td1 = document.createElement('td');
      const td2 = document.createElement('td');

      [td1, td2].forEach(td => {
        td.style.border = '1px solid black';
        td.style.padding = '8px';
        td.style.whiteSpace = 'nowrap';
        td.style.width = 'auto';
      });

      td1.style.fontWeight = 'bold';
      td1.textContent = label;
      td2.textContent = value || '-';

      tr.appendChild(td1);
      tr.appendChild(td2);
      table.appendChild(tr);
    });

    // Add remarks as text after the table if they exist
    if (candidate.remarks) {
      const remarksDiv = document.createElement('div');
      remarksDiv.style.marginTop = '16px';
      remarksDiv.innerHTML = `<strong>Remarks:</strong>\n${candidate.remarks}`;
      tempDiv.appendChild(table);
      tempDiv.appendChild(remarksDiv);
    } else {
      tempDiv.appendChild(table);
    }

    document.body.appendChild(tempDiv);

    const range = document.createRange();
    range.selectNode(tempDiv);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();
    }

    document.body.removeChild(tempDiv);
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
                    transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            {/* Warning Message */}
            <div className="px-6 pt-2 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-md mx-6 mb-4">
              <p>
                <strong>Note:</strong> Please do not edit any part of the subject or body content after copying. Share the generated content exactly as it appears. 
                <br />
                This is important because manual edits have caused issues with our ETL processes and downstream validations, even though these systems are already configured to handle the correct format. 
                <br />
                If you need to make changes, please do so in the form provided — the content will update automatically.
              </p>
            </div>


            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <button
                  onClick={copySubjectFormat}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  title="Copy Subject"
                >
                  {copySuccess === 'subject' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                <h3 className="text-lg font-medium text-gray-900 truncate max-w-xl">
                  {getTitle()}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="flex items-start space-x-4">
              <div className="sticky top-0">
                <button
                  onClick={copyTableFormat}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  title="Copy Table"
                >
                  {copySuccess === 'table' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <div className="flex-1 min-w-0 space-y-6">
                {candidate.taskType === 'assessment' && candidate.screeningDone && (
                  <div className="flex items-center justify-center bg-gray-50 p-4 rounded-lg">
                    <img 
                      src="https://media.tenor.com/yhAAYQqxbcgAAAAi/little-pills.gif" 
                      alt="Screening Done" 
                      className="h-8 w-8"
                    />
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-black text-black border-spacing-0">
                    <tbody>
                      {rows.map(({ label, value }) => (
                        <tr key={label} className="border-b border-black">
                          <td className="border border-black p-2 leading-relaxed font-semibold whitespace-nowrap">
                            {label}
                          </td>
                          <td className="border border-black p-2 leading-relaxed">
                            {value || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {candidate.remarks && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Remarks</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{candidate.remarks}</p>
                  </div>
                )}
              </div>
            </div>
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
