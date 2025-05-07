import React from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Building2,
  FileText,
  BriefcaseIcon,
  UserCheckIcon,
  ClipboardCheckIcon,
  Copy,
  Mail,
  Phone
} from 'lucide-react';
import { Candidate, TaskType } from '../types';
import { TASK_TYPE_COLORS, TASK_TYPE_LABELS } from '../constants';

interface CandidateTimelineProps {
  candidates: Candidate[];
  onView: (candidate: Candidate) => void;
  onEdit: (candidate: Candidate) => void;
  onDelete: (id: string) => void;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  formatDateTime: (dateTime?: string) => string;
  formatDate: (date?: string) => string;
}

export default function CandidateTimeline({
  candidates,
  onView,
  onEdit,
  onDelete,
  formatDateTime,
  formatDate,
}: CandidateTimelineProps) {
  // Group candidates by type
  const candidatesByType: Record<TaskType, Candidate[]> = {
    interview: [],
    assessment: [],
    mock: [],
    resumeUnderstanding: [],
    resumeReview: []
  };
  
  candidates.forEach(candidate => {
    if (candidatesByType[candidate.taskType]) {
      candidatesByType[candidate.taskType].push(candidate);
    }
  });
  
  // Sort each group - interviews, assessments by date
  Object.keys(candidatesByType).forEach(type => {
    const taskType = type as TaskType;
    candidatesByType[taskType].sort((a, b) => {
      let dateA, dateB;
      
      if (taskType === 'interview') {
        dateA = a.interviewDateTime ? new Date(a.interviewDateTime) : new Date(0);
        dateB = b.interviewDateTime ? new Date(b.interviewDateTime) : new Date(0);
      } else if (taskType === 'assessment') {
        dateA = a.assessmentDeadline ? new Date(a.assessmentDeadline) : new Date(0);
        dateB = b.assessmentDeadline ? new Date(b.assessmentDeadline) : new Date(0);
      } else if (['mock', 'resumeUnderstanding'].includes(taskType)) {
        dateA = a.availabilityDateTime ? new Date(a.availabilityDateTime) : new Date(0);
        dateB = b.availabilityDateTime ? new Date(b.availabilityDateTime) : new Date(0);
      } else {
        // For types without dates, sort by creation date
        dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      }
      
      return dateA.getTime() - dateB.getTime();
    });
  });
  
  const getTaskTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'interview': return <BriefcaseIcon className="h-5 w-5" />;
      case 'assessment': return <ClipboardCheckIcon className="h-5 w-5" />;
      case 'mock': return <UserCheckIcon className="h-5 w-5" />;
      case 'resumeUnderstanding': return <FileText className="h-5 w-5" />;
      case 'resumeReview': return <FileText className="h-5 w-5" />;
    }
  };

  const handleDuplicateAndEdit = (candidate: Candidate) => {
    const duplicatedCandidate: Candidate = {
      ...candidate,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onEdit(duplicatedCandidate);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied to clipboard'))
      .catch(err => console.error('Failed to copy: ', err));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {(Object.keys(candidatesByType) as TaskType[]).map(type => {
        const typeData = candidatesByType[type];
        if (typeData.length === 0) return null;
        
        const colors = TASK_TYPE_COLORS[type];
        
        return (
          <div key={type} className="bg-white shadow-sm rounded-lg overflow-hidden">
            {/* Section Header */}
            <div className={`p-5 border-b ${colors.border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-md ${colors.bg} mr-3`}>
                    {getTaskTypeIcon(type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {TASK_TYPE_LABELS[type]}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {typeData.length} candidate{typeData.length !== 1 ? 's' : ''} scheduled
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Candidate Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {typeData.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`relative rounded-lg border ${colors.border} p-4 hover:shadow-md transition-shadow duration-200`}
                >
                  {/* Header */}
                  <div className="mb-3">
                    <h3 className="font-medium text-gray-900">
                      {candidate.name}
                    </h3>
                  </div>

                  {/* Technology Badge */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                      {candidate.technology}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    {candidate.taskType === 'interview' && (
                      <>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDateTime(candidate.interviewDateTime)}
                        </div>
                        {candidate.jobTitle && (
                          <div className="flex items-center text-gray-600">
                            <BriefcaseIcon className="h-4 w-4 mr-2" />
                            {candidate.jobTitle}
                          </div>
                        )}
                      </>
                    )}

                    {candidate.taskType === 'assessment' && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Due: {formatDate(candidate.assessmentDeadline)}
                      </div>
                    )}

                    {['mock', 'resumeUnderstanding'].includes(candidate.taskType) && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDateTime(candidate.availabilityDateTime)}
                      </div>
                    )}

                    {candidate.endClient && (
                      <div className="flex items-center text-gray-600">
                        <Building2 className="h-4 w-4 mr-2" />
                        {candidate.endClient}
                      </div>
                    )}

                    {candidate.duration && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {candidate.duration} minutes
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => copyToClipboard(candidate.email)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{candidate.email}</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(candidate.phone)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      <Phone className="h-4 w-4" />
                      <span>{candidate.phone}</span>
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-4 gap-2">
                    <button
                      onClick={() => onView(candidate)}
                      className="flex items-center justify-center p-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(candidate)}
                      className="flex items-center justify-center p-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateAndEdit(candidate)}
                      className="flex items-center justify-center p-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      title="Duplicate & Edit"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(candidate.id)}
                      className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}