import React, { useState, useEffect } from 'react';
import { Plus, CalendarClock } from 'lucide-react';
import CandidateFormContainer from './components/CandidateFormContainer';
import CandidateTimeline from './components/CandidateTimeline';
import { DetailModal } from './components/DetailModal';
import { LoadingOverlay } from './components/LoadingOverlay';
import { TabNavigation } from './components/TabNavigation';
import { EmptyState } from './components/EmptyState';
import { useToast } from './hooks/useToast';
import { useImagePaste } from './hooks/useImagePaste';
import { useAutocompleteData } from './hooks/useAutocompleteData';
import type { FormData, Candidate, TabId } from './types';
import { INITIAL_FORM_DATA } from './constants';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('new');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const { autocompleteData, updateAutocompleteData } = useAutocompleteData(candidates);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [submittedCandidate, setSubmittedCandidate] = useState<Candidate | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const { showToast, ToastContainer } = useToast();
  const { isAnalyzing, error: analysisError, handlePaste } = useImagePaste(setFormData);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('candidates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCandidates(Array.isArray(parsed) ? parsed : []);
      } catch {
        console.error('Failed to parse candidates');
      }
    }
  }, []);

  // Paste‐to‐form image handling
  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // Persist helper
  const saveCandidates = (updated: Candidate[]) => {
    setCandidates(updated);
    localStorage.setItem('candidates', JSON.stringify(updated));
    updateAutocompleteData(updated);
  };

  // Create or update on form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const candidateToSave: Candidate = {
      id: editingCandidate?.id || crypto.randomUUID(),
      ...formData,
      createdAt: editingCandidate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = editingCandidate
      ? candidates.map(c => c.id === editingCandidate.id ? candidateToSave : c)
      : [...candidates, candidateToSave];

    saveCandidates(updatedList);
    setSubmittedCandidate(candidateToSave);
    setShowSuccessModal(true);

    // Reset form state
    setEditingCandidate(null);
    setFormData(INITIAL_FORM_DATA);
    setActiveTab('scheduled');

    showToast(
      editingCandidate ? 'Candidate updated successfully' : 'New candidate added successfully',
      'success'
    );
  };

  // Delete handler
  const handleDelete = (id: string) => {
    const target = candidates.find(c => c.id === id);
    if (!target) return;
    const filtered = candidates.filter(c => c.id !== id);
    saveCandidates(filtered);
    showToast(`Removed ${target.name}`, 'info');
    setMenuOpenId(null);
  };

  // Edit flow: prefill & mark as editing
  const handleEdit = (candidate: Candidate) => {
    setFormData(candidate);
    setEditingCandidate(candidate);
    setMenuOpenId(null);
    setActiveTab('new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Duplicate & Edit flow: only prefill, no immediate save
  const handleDuplicate = (candidate: Candidate) => {
    const clone: Candidate = {
      ...candidate,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFormData(clone);
    setEditingCandidate(null);    // ensures handleSubmit will append
    setMenuOpenId(null);
    setActiveTab('new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Duplicated candidate — now edit and save as new', 'info');
  };

  // (Your existing date‐formatters and getModalTitle go here…)

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <TabNavigation
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            {
              id: 'new',
              label: editingCandidate ? 'Edit Candidate' : 'Add Candidate',
              icon: Plus
            },
            {
              id: 'scheduled',
              label: 'Scheduled',
              icon: CalendarClock,
              badge: candidates.length || undefined
            }
          ]}
        />

        <div className="mt-4">
          {activeTab === 'new' ? (
            <>
              {isAnalyzing && <LoadingOverlay />}
              {analysisError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{analysisError.message}</p>
                </div>
              )}
              <CandidateFormContainer
                formData={formData}
                setFormData={setFormData}
                autocompleteData={autocompleteData}
                onSubmit={handleSubmit}
                isEditing={!!editingCandidate}
              />
            </>
          ) : (
            <>
              {candidates.length === 0 ? (
                <EmptyState
                  title="No candidates scheduled"
                  description="Add a new candidate to get started"
                  action={{ label: 'Add Candidate', onClick: () => setActiveTab('new') }}
                />
              ) : (
                <CandidateTimeline
                  candidates={candidates}
                  onView={setViewingCandidate}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  menuOpenId={menuOpenId}
                  setMenuOpenId={setMenuOpenId}
                  /* pass your formatDateTime & formatDate here */
                />
              )}
            </>
          )}
        </div>
      </main>

      {showSuccessModal && submittedCandidate && (
        <DetailModal
          candidate={submittedCandidate}
          /* your title, subtitle, and formatters */
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {viewingCandidate && (
        <DetailModal
          candidate={viewingCandidate}
          /* your title, subtitle, and formatters */
          onClose={() => setViewingCandidate(null)}
        />
      )}

      <ToastContainer />
    </div>
  );
}
