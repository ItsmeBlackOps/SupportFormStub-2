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

  useEffect(() => {
    const saved = localStorage.getItem('candidates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCandidates(Array.isArray(parsed) ? parsed : []);
      } catch (err) {
        console.error('Failed to parse candidates:', err);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const saveCandidates = (updatedCandidates: Candidate[]) => {
    setCandidates(updatedCandidates);
    localStorage.setItem('candidates', JSON.stringify(updatedCandidates));
    updateAutocompleteData(updatedCandidates);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCandidate: Candidate = {
      id: editingCandidate?.id || crypto.randomUUID(),
      ...formData,
      createdAt: editingCandidate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedCandidates = editingCandidate
      ? candidates.map(c => c.id === editingCandidate.id ? newCandidate : c)
      : [...candidates, newCandidate];

    saveCandidates(updatedCandidates);
    setSubmittedCandidate(newCandidate);
    setShowSuccessModal(true);
    setEditingCandidate(null);
    setFormData(INITIAL_FORM_DATA);
    setActiveTab('scheduled');

    showToast(
      editingCandidate ? 'Candidate updated successfully' : 'New candidate added successfully',
      'success'
    );
  };

  const handleDelete = (id: string) => {
    const candidateToDelete = candidates.find(c => c.id === id);
    if (candidateToDelete) {
      const updated = candidates.filter(c => c.id !== id);
      saveCandidates(updated);
      showToast(`Removed ${candidateToDelete.name}`, 'info');
      setMenuOpenId(null);
    }
  };

  const handleEdit = (candidate: Candidate) => {
    setFormData(candidate);
    setEditingCandidate(candidate);
    setMenuOpenId(null);
    setActiveTab('new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicate = (candidate: Candidate) => {
    const duplicated: Candidate = {
      ...candidate,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // Pre-fill the form *without* saving yet
    setFormData(duplicated);
    setEditingCandidate(null);    // ← ensures handleSubmit will append
    setActiveTab('new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Duplicated candidate — now edit and save as new', 'info');
  };

  // Date formatters omitted for brevity—use your existing ones

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

        <div className="mt-4 transition-all duration-200">
          {activeTab === 'new' && (
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
          )}

          {activeTab === 'scheduled' && (
            <>
              {candidates.length === 0 ? (
                <EmptyState
                  title="No candidates scheduled"
                  description="Add a new candidate to get started"
                  action={{
                    label: 'Add Candidate',
                    onClick: () => setActiveTab('new')
                  }}
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
                  /* pass your formatDateTime/formatDate here */
                />
              )}
            </>
          )}
        </div>
      </main>

      {showSuccessModal && submittedCandidate && (
        <DetailModal
          candidate={submittedCandidate}
          /* your title, subtitle, formatters */
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {viewingCandidate && (
        <DetailModal
          candidate={viewingCandidate}
          /* your title, subtitle, formatters */
          onClose={() => setViewingCandidate(null)}
        />
      )}

      <ToastContainer />
    </div>
  );
}
