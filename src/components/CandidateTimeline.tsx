"use client"
import { useState, useEffect } from "react"
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
  SortDesc,
  Star,
  CheckCircle2,
} from "lucide-react"
import type { Candidate, TaskType } from "../types"
import { TASK_TYPE_COLORS, TASK_TYPE_LABELS } from "../constants"

interface CandidateTimelineProps {
  candidates: Candidate[]
  onView: (candidate: Candidate) => void
  onEdit: (candidate: Candidate) => void
  onClone: (candidate: Candidate) => void
  onDelete: (id: string) => void
  menuOpenId: string | null
  setMenuOpenId: (id: string | null) => void
  formatDateTime: (dateTime?: string) => string
  formatDate: (date?: string) => string
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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<TaskType[]>([])
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [localCandidates, setLocalCandidates] = useState(candidates)

  useEffect(() => {
    setLocalCandidates(candidates)
  }, [candidates])

  useEffect(() => {
    const handleStatusUpdate = (event: CustomEvent) => {
      const { subject, status } = event.detail
      setLocalCandidates((prev) =>
        prev.map((candidate) => (candidate.technology === subject ? { ...candidate, status } : candidate)),
      )
    }

    window.addEventListener("subjectStatusChanged", handleStatusUpdate as EventListener)
    return () => {
      window.removeEventListener("subjectStatusChanged", handleStatusUpdate as EventListener)
    }
  }, [])

  const filteredCandidates = localCandidates.filter((candidate) => {
    const matchesSearch =
      searchTerm === "" ||
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.technology.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.phone.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(candidate.taskType)

    return matchesSearch && matchesType
  })

  const candidatesByType: Record<TaskType, Candidate[]> = {
    interview: [],
    assessment: [],
    mock: [],
    resumeUnderstanding: [],
    resumeReview: [],
  }

  filteredCandidates.forEach((candidate) => {
    candidatesByType[candidate.taskType].push(candidate)
  })

  Object.keys(candidatesByType).forEach((type) => {
    const taskType = type as TaskType
    candidatesByType[taskType].sort((a, b) => {
      let dateA, dateB

      if (taskType === "interview") {
        dateA = a.interviewDateTime ? new Date(a.interviewDateTime) : new Date(0)
        dateB = b.interviewDateTime ? new Date(b.interviewDateTime) : new Date(0)
      } else if (taskType === "assessment") {
        dateA = a.assessmentDeadline ? new Date(a.assessmentDeadline) : new Date(0)
        dateB = b.assessmentDeadline ? new Date(b.assessmentDeadline) : new Date(0)
      } else if (["mock", "resumeUnderstanding"].includes(taskType)) {
        dateA = a.availabilityDateTime ? new Date(a.availabilityDateTime) : new Date(0)
        dateB = b.availabilityDateTime ? new Date(b.availabilityDateTime) : new Date(0)
      } else {
        dateA = a.createdAt ? new Date(a.createdAt) : new Date(0)
        dateB = b.createdAt ? new Date(b.createdAt) : new Date(0)
      }

      return sortOrder === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
    })
  })

  const getTaskTypeIcon = (type: TaskType) => {
    switch (type) {
      case "interview":
        return <BriefcaseIcon className="h-5 w-5" />
      case "assessment":
        return <ClipboardCheckIcon className="h-5 w-5" />
      case "mock":
        return <UserCheckIcon className="h-5 w-5" />
      case "resumeUnderstanding":
        return <FileText className="h-5 w-5" />
      case "resumeReview":
        return <FileText className="h-5 w-5" />
    }
  }

  const toggleTaskType = (type: TaskType) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "acknowledged":
        return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
      case "pending":
        return "bg-amber-100 text-amber-800 ring-1 ring-amber-200"
      default:
        return "bg-gray-100 text-gray-800 ring-1 ring-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/60">
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search candidates by name, technology, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border-0 rounded-xl text-sm bg-gray-50 ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filter by type:</span>
              </div>
              {(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleTaskType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                    ${
                      selectedTypes.includes(type)
                        ? `${TASK_TYPE_COLORS[type].bg} ${TASK_TYPE_COLORS[type].text} ring-1 ring-current/20`
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {TASK_TYPE_LABELS[type]}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 group"
              title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
            >
              {sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
              ) : (
                <SortDesc className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Candidates by Type */}
      <div className="space-y-6">
        {(Object.keys(candidatesByType) as TaskType[]).map((type) => {
          const typeData = candidatesByType[type]
          if (typeData.length === 0) return null

          const colors = TASK_TYPE_COLORS[type]

          return (
            <div key={type} className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className={`px-6 py-4 border-b border-gray-200/60 bg-gradient-to-r ${colors.bg}/30`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${colors.bg} ${colors.text}`}>{getTaskTypeIcon(type)}</div>
                    <div>
                      <h3 className="font-semibold text-white">{TASK_TYPE_LABELS[type]}</h3>
                      <p className="text-sm text-white">{typeData.length} candidates</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {typeData.map((candidate) => (
                  <div key={candidate.id} className="p-6 hover:bg-gray-50/50 transition-colors duration-200">
                    <div className="flex items-center justify-between gap-6">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="text-base font-semibold text-gray-900 truncate">{candidate.name}</h4>
                          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                            {candidate.technology}
                          </span>
                          {candidate.expert && (
                            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
                              <Star className="h-3 w-3" />
                              {candidate.expert}
                            </span>
                          )}
                          {candidate.status && (
                            <span
                              className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(candidate.status)}`}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {candidate.status}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-3">
                          {candidate.taskType === "interview" && (
                            <>
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" />
                                {formatDateTime(candidate.interviewDateTime)}
                              </span>
                              {candidate.jobTitle && (
                                <span className="flex items-center gap-1.5">
                                  <BriefcaseIcon className="h-3 w-3" />
                                  {candidate.jobTitle}
                                </span>
                              )}
                            </>
                          )}

                          {candidate.taskType === "assessment" && (
                            <>
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" />
                                Due: {formatDate(candidate.assessmentDeadline)}
                              </span>
                              {candidate.screeningDone && (
                                <span className="flex items-center gap-1.5">
                                  <img
                                    src="https://media.tenor.com/yhAAYQqxbcgAAAAi/little-pills.gif"
                                    alt="Screening Done"
                                    className="h-4 w-4"
                                  />
                                  Screening Done
                                </span>
                              )}
                            </>
                          )}

                          {["mock", "resumeUnderstanding"].includes(candidate.taskType) && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              {formatDateTime(candidate.availabilityDateTime)}
                            </span>
                          )}

                          {candidate.endClient && (
                            <span className="flex items-center gap-1.5">
                              <Building2 className="h-3 w-3" />
                              {candidate.endClient}
                            </span>
                          )}

                          {candidate.duration && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              {candidate.duration}m
                            </span>
                          )}
                        </div>

                        <div className="flex gap-6 text-xs text-gray-500">
                          <a
                            href={`mailto:${candidate.email}`}
                            className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors duration-200"
                          >
                            <Mail className="h-3 w-3" />
                            {candidate.email}
                          </a>
                          <a
                            href={`tel:${candidate.phone}`}
                            className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors duration-200"
                          >
                            <Phone className="h-3 w-3" />
                            {candidate.phone}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onView(candidate)}
                          className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(candidate)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onClone(candidate)}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200"
                          title="Clone Entry"
                        >
                          <Files className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(candidate.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
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
          )
        })}
      </div>
    </div>
  )
}
