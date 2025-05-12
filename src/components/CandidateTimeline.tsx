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
  Files,
  Mail,
  Phone,
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
  onClone: (candidate: Candidate) => void;
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
  onClone,
  onDelete,
  menuOpenId,
  setMenuOpenId,
  formatDateTime,
  formatDate,
}: CandidateTimelineProps) {
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
    candidatesByType[candidate.taskType].push(candidate);
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

  const toggleTaskType = (type: TaskType) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2 items-center">
              <Filter className="h-4 w-4 text-gray-400" />
              {(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleTaskType(type)}
                  className={`px-2 py-1 rounded-md text-xs font-medium
                    ${selectedTypes.includes(type)
                      ? `${TASK_TYPE_COLORS[type].bg} ${TASK_TYPE_COLORS[type].text}`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {TASK_TYPE_LABELS[type]}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {sortOrder === 'asc' 
                ? <SortAsc className="h-4 w-4 text-gray-500" />
                : <SortDesc className="h-4 w-4 text-gray-500" />
              }
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {(Object.keys(candidatesByType) as TaskType[]).map(type => {
          const typeData = candidatesByType[type];
          if (typeData.length === 0) return null;
          
          const colors = TASK_TYPE_COLORS[type];
          
          return (
            <div key={type} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className={`px-4 py-3 border-b ${colors.border} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  {getTaskTypeIcon(type)}
                  <span className="font-medium">{TASK_TYPE_LABELS[type]} ({typeData.length})</span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {typeData.map((candidate) => (
                  <div key={candidate.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium truncate">{candidate.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                            {candidate.technology}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          {candidate.taskType === 'interview' && (
                            <>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDateTime(candidate.interviewDateTime)}
                              </span>
                              {candidate.jobTitle && (
                                <span className="flex items-center gap-1">
                                  <BriefcaseIcon className="h-3 w-3" />
                                  {candidate.jobTitle}
                                </span>
                              )}
                            </>
                          )}

                          {candidate.taskType === 'assessment' && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {formatDate(candidate.assessmentDeadline)}
                            </span>
                          )}

                          {['mock', 'resumeUnderstanding'].includes(candidate.taskType) && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateTime(candidate.availabilityDateTime)}
                            </span>
                          )}

                          {candidate.endClient && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {candidate.endClient}
                            </span>
                          )}

                          {candidate.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {candidate.duration}m
                            </span>
                          )}
                        </div>

                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <a href={`mailto:${candidate.email}`} className="flex items-center gap-1 hover:text-gray-700">
                            <Mail className="h-3 w-3" />
                            {candidate.email}
                          </a>
                          <a href={`tel:${candidate.phone}`} className="flex items-center gap-1 hover:text-gray-700">
                            <Phone className="h-3 w-3" />
                            {candidate.phone}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onView(candidate)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(candidate)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onClone(candidate)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title="Clone Entry"
                        >
                          <Files className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(candidate.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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