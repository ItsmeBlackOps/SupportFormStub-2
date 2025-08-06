"use client"

import React, { useState, useEffect } from "react"
import { Plus, CalendarClock } from "lucide-react"
import CandidateFormContainer from "./components/CandidateFormContainer"
import CandidateTimeline from "./components/CandidateTimeline"
import PlacementForm from "./components/PlacementForm"
import { DetailModal } from "./components/DetailModal"
import { LoadingOverlay } from "./components/LoadingOverlay"
import { TabNavigation } from "./components/TabNavigation"
import { EmptyState } from "./components/EmptyState"
import { TourButton } from "./components/TourButton"
import { useToast } from "./hooks/useToast"
import { useTour } from "./hooks/useTour"
import { useImagePaste } from "./hooks/useImagePaste"
import { useAutocompleteData } from "./hooks/useAutocompleteData"
import { useWebSocketAutocomplete } from "./hooks/useWebSocketAutocomplete"
import { useInterviewNotifications } from "./hooks/useInterviewNotifications"
import type { FormData, Candidate, TabId } from "./types"
import { INITIAL_FORM_DATA } from "./constants"

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("new")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const { autocompleteData, updateAutocompleteData } = useAutocompleteData(candidates)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [submittedCandidate, setSubmittedCandidate] = useState<Candidate | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const { showToast, ToastContainer } = useToast()
  const { isAnalyzing, error: analysisError, handlePaste } = useImagePaste(setFormData)
  const { startMainTour, hasCompletedTour } = useTour()

  useWebSocketAutocomplete(setFormData)
  useInterviewNotifications(candidates)

  useEffect(() => {
    const hasSeenTour = hasCompletedTour()
    if (!hasSeenTour && candidates.length === 0) {
      const timer = setTimeout(() => {
        startMainTour()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [startMainTour, hasCompletedTour, candidates.length])

  useEffect(() => {
    const saved = localStorage.getItem("candidates")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCandidates(Array.isArray(parsed) ? parsed : [])
      } catch (err) {
        console.error("Failed to parse candidates:", err)
      }
    }

    const handleToast = (event: CustomEvent) => {
      const { message, type } = event.detail
      showToast(message, type)
    }

    window.addEventListener("showToast", handleToast as EventListener)
    return () => window.removeEventListener("showToast", handleToast as EventListener)
  }, [showToast])

  useEffect(() => {
    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [handlePaste])

  useEffect(() => {
    const handleStatusUpdate = (event: CustomEvent) => {
      const { subject, status } = event.detail
      setCandidates((prev) =>
        prev.map((candidate) => (candidate.subject === subject ? { ...candidate, status } : candidate)),
      )
    }

    window.addEventListener("subjectStatusChanged", handleStatusUpdate as EventListener)
    return () => {
      window.removeEventListener("subjectStatusChanged", handleStatusUpdate as EventListener)
    }
  }, [])

  const saveCandidates = (updated: Candidate[]) => {
    setCandidates(updated)
    localStorage.setItem("candidates", JSON.stringify(updated))
    updateAutocompleteData(updated)
  }

  const getSubjectTitle = (candidate: Candidate) => {
    const name = candidate.name
    const tech = candidate.technology

    switch (candidate.taskType) {
      case "interview":
        return `Interview Support - ${name} - ${tech} - ${formatDateTime(candidate.interviewDateTime)}`
      case "assessment":
        return `Assessment Support - ${name} - ${tech} - ${formatDate(candidate.assessmentDeadline)}`
      case "mock":
        return `Mock Interview - ${name} - ${tech} - ${candidate.mockMode} - ${formatDateTime(candidate.availabilityDateTime)}`
      case "resumeUnderstanding":
        return `Resume Understanding - ${name} - ${tech} - ${formatDateTime(candidate.availabilityDateTime)}`
      case "resumeReview":
        return `Resume Making - ${name} - ${tech}`
      default:
        return ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const candidateToSave: Candidate = {
      id: editingCandidate?.id || crypto.randomUUID(),
      ...formData,
      subject: getSubjectTitle({ ...formData, id: "", createdAt: "", updatedAt: "" }),
      createdAt: editingCandidate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedList = editingCandidate
      ? candidates.map((c) => (c.id === editingCandidate.id ? candidateToSave : c))
      : [...candidates, candidateToSave]

    saveCandidates(updatedList)
    setSubmittedCandidate(candidateToSave)
    setShowSuccessModal(true)
    setEditingCandidate(null)
    setFormData(INITIAL_FORM_DATA)
    setActiveTab("scheduled")
    showToast(editingCandidate ? "Candidate updated successfully" : "New candidate added successfully", "success")
  }

  const handleDelete = (id: string) => {
    const target = candidates.find((c) => c.id === id)
    if (!target) return
    const filtered = candidates.filter((c) => c.id !== id)
    saveCandidates(filtered)
    showToast(`Removed ${target.name}`, "info")
    setMenuOpenId(null)
  }

  const handleEdit = (candidate: Candidate) => {
    setFormData(candidate)
    setEditingCandidate(candidate)
    setMenuOpenId(null)
    setActiveTab("new")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleClone = (candidate: Candidate) => {
    setFormData({ ...candidate })
    setEditingCandidate(null)
    setMenuOpenId(null)
    setActiveTab("new")
    window.scrollTo({ top: 0, behavior: "smooth" })
    showToast("Cloned candidate - edit and save as new", "info")
  }

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const formatDateTime = (dt?: string) => {
    if (!dt) return ""
    const [datePart, timePart = "00:00"] = dt.split("T")
    const [year, mo, da] = datePart.split("-").map(Number)
    let [h] = timePart.split(":").map(Number)
    const [, m] = timePart.split(":").map(Number)
    const ampm = h >= 12 ? "PM" : "AM"
    h = h % 12 || 12
    return `${MONTHS[mo - 1]} ${da}, ${year} at ${h}:${String(m).padStart(2, "0")} ${ampm}`
  }

  const formatDate = (d?: string) => {
    if (!d) return ""
    const [year, month, day] = d.split("T")[0].split("-")
    return `${MONTHS[Number.parseInt(month, 10) - 1]} ${Number.parseInt(day, 10)}, ${year}`
  }

  const getModalTitle = (c: Candidate) => {
    switch (c.taskType) {
      case "interview":
        return `Interview Support — ${c.jobTitle || "Role"}`
      case "assessment":
        return `Assessment Support — Due ${formatDate(c.assessmentDeadline)}`
      case "mock":
        return `Mock Interview — ${c.mockMode || "Session"}`
      case "resumeUnderstanding":
        return "Resume Understanding"
      case "resumeReview":
        return "Resume Review"
      default:
        return "Candidate Details"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#374151_1px,transparent_1px),linear-gradient(to_bottom,#374151_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <main className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 lg:py-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <div className="flex-1">
            <TabNavigation
              activeTab={activeTab}
              onChange={setActiveTab}
              tabs={[
                {
                  id: "new",
                  label: editingCandidate ? "Edit Candidate" : "Add Candidate",
                  icon: Plus,
                },
                {
                  id: "scheduled",
                  label: "Scheduled",
                  icon: CalendarClock,
                  badge: candidates.length || undefined,
                  "data-tour": "scheduled-tab",
                },
              ]}
            />
          </div>
          <div className="flex-shrink-0">
            <TourButton variant="secondary" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="transition-all duration-300 ease-in-out">
          {activeTab === "new" ? (
            <div className="space-y-4">
              {/* Analysis Loading State */}
              {isAnalyzing && <LoadingOverlay />}

              {/* Error State */}
              {analysisError && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <div className="bg-red-900/50 border border-red-700 rounded-xl p-3 shadow-sm">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-red-400 rounded-full mt-1.5" />
                      </div>
                      <div className="ml-2">
                        <p className="text-xs font-medium text-red-200">Analysis Error</p>
                        <p className="text-xs text-red-300 mt-0.5">{analysisError.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Container */}
              <div className="animate-in fade-in-50 duration-500">
                <CandidateFormContainer
                  formData={formData}
                  setFormData={setFormData}
                  autocompleteData={autocompleteData}
                  onSubmit={handleSubmit}
                  isEditing={!!editingCandidate}
                />
              </div>
            </div>
          ) : activeTab === "scheduled" ? (
            <div className="animate-in fade-in-50 duration-500">
              {candidates.length === 0 ? (
                <div className="flex items-center justify-center min-h-[50vh]">
                  <EmptyState
                    title="No candidates scheduled"
                    description="Add a new candidate to get started with your interview management"
                    action={{
                      label: "Add Candidate",
                      onClick: () => setActiveTab("new"),
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <CandidateTimeline
                    candidates={candidates}
                    onView={setViewingCandidate}
                    onEdit={handleEdit}
                    onClone={handleClone}
                    onDelete={handleDelete}
                    menuOpenId={menuOpenId}
                    setMenuOpenId={setMenuOpenId}
                    formatDateTime={formatDateTime}
                    formatDate={formatDate}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in-50 duration-500">
              <PlacementForm />
            </div>
          )}
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && submittedCandidate && (
        <DetailModal
          candidate={submittedCandidate}
          title={getModalTitle(submittedCandidate)}
          subtitle={`${submittedCandidate.name} — ${submittedCandidate.technology}`}
          onClose={() => setShowSuccessModal(false)}
          formatDateTime={formatDateTime}
          formatDate={formatDate}
        />
      )}

      {/* View Modal */}
      {viewingCandidate && (
        <DetailModal
          candidate={viewingCandidate}
          title={getModalTitle(viewingCandidate)}
          subtitle={`${viewingCandidate.name} — ${viewingCandidate.technology}`}
          onClose={() => setViewingCandidate(null)}
          formatDateTime={formatDateTime}
          formatDate={formatDate}
        />
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  )
}
