import React, { useState } from 'react';
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
  Mail,
  Phone,
  Check,
  Search,
  Filter,
  SortAsc,
  SortDesc
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
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<TaskType[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = searchTerm === '' || 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.technology.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(candidate.taskType);

    return matchesSearch && matchesType;
  });

  const candidatesByType: Record<TaskType, Candidate[]> = {
    interview: [],
    assessment: [],
    mock: [],
    resumeUnderstanding: [],
    resumeReview: []
  };
  
  filteredCandidates.forEach(candidate => {
    if (candidatesByType[candidate.taskType]) {
      candidatesByType[candidate.taskType].push(candidate);
    }
  });
  
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
        dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      }
      
      return sortOrder === 'asc' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(id);
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };

  const toggleTaskType = (type: TaskType) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, technology, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white 
                        placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 
                        focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2 mr-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleTaskType(type)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                      ${selectedTypes.includes(type)
                        ? `${TASK_TYPE_COLORS[type].bg} ${TASK_TYPE_COLORS[type].text}`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } transition-colors duration-200`}
                  >
                    {TASK_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm 
                        font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                        transition-colors duration-200 whitespace-nowrap"
            >
              {sortOrder === 'asc' ? (
                <>
                  <SortAsc className="h-4 w-4 mr-2" />
                  Oldest First
                </>
              ) : (
                <>
                  <SortDesc className="h-4 w-4 mr-2" />
                  Newest First
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {(Object.keys(candidatesByType) as TaskType[]).map(type => {
          const typeData = candidatesByType[type];
          if (typeData.length === 0) return null;
          
          const colors = TASK_TYPE_COLORS[type];
          
          return (
            <div key={type} className="bg-white shadow-sm rounded-lg overflow-hidden">
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
              
              <div className="divide-y divide-gray-200">
                {typeData.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="p-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {candidate.name}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                            {candidate.technology}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          {candidate.taskType === 'interview' && (
                            <>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                {formatDateTime(candidate.interviewDateTime)}
                              </div>
                              {candidate.jobTitle && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <BriefcaseIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                  {candidate.jobTitle}
                                </div>
                              )}
                            </>
                          )}

                          {candidate.taskType === 'assessment' && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
                              Due: {formatDate(candidate.assessmentDeadline)}
                            </div>
                          )}

                          {['mock', 'resumeUnderstanding'].includes(candidate.taskType) && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
                              {formatDateTime(candidate.availabilityDateTime)}
                            </div>
                          )}

                          {candidate.endClient && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Building2 className="h-4 w-4 mr-1.5 flex-shrink-0" />
                              {candidate.endClient}
                            </div>
                          )}

                          {candidate.duration && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1.5 flex-shrink-0" />
                              {candidate.duration} minutes
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <button
                            onClick={() => copyToClipboard(candidate.email, `email-${candidate.id}`)}
                            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                          >
                            <Mail className="h-4 w-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{candidate.email}</span>
                            {copySuccess === `email-${candidate.id}` && (
                              <Check className="h-4 w-4 text-green-500 ml-1" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(candidate.phone, `phone-${candidate.id}`)}
                            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                          >
                            <Phone className="h-4 w-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{candidate.phone}</span>
                            {copySuccess === `phone-${candidate.id}` && (
                              <Check className="h-4 w-4 text-green-500 ml-1" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:flex-col">
                        <button
                          onClick={() => onView(candidate)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center p-2 text-gray-500 
                                   hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                          <span className="ml-2 sm:hidden">View</span>
                        </button>
                        <button
                          onClick={() => onEdit(candidate)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center p-2 text-gray-500 
                                   hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full"
                          title="Edit"
                        >
                          <Edit2 className="h-5 w-5" />
                          <span className="ml-2 sm:hidden">Edit</span>
                        </button>
                        <button
                          onClick={() => onDelete(candidate.id)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center p-2 text-red-500 
                                   hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors w-full"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                          <span className="ml-2 sm:hidden">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}