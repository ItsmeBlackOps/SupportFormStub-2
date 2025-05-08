import React, { useState, useEffect } from 'react';
import { UserRound, Plus, CalendarClock } from 'lucide-react';
import CandidateFormContainer from './components/CandidateFormContainer';
import CandidateTimeline from './components/CandidateTimeline';
import { DetailModal } from './components/DetailModal';
import { LoadingOverlay } from './components/LoadingOverlay';
import { TabNavigation } from './components/TabNavigation';
import { EmptyState } from './components/EmptyState';
import { HeaderBar } from './components/HeaderBar';
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

  // Load candidates from localStorage
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

  // Register paste event handler
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
    
    // Reset form after successful submission
    setFormData({
      ...INITIAL_FORM_DATA,
      taskType: formData.taskType // maintain the selected task type
    });
    
    showToast(
      editingCandidate ? 'Candidate updated successfully' : 'New candidate added successfully',
      'success'
    );
    
    // Switch to scheduled tab after submission
    setActiveTab('scheduled');
  };

  const handleDelete = (id: string) => {
    const candidateToDelete = candidates.find(c => c.id === id);
    if (candidateToDelete) {
      const updatedCandidates = candidates.filter(c => c.id !== id);
      saveCandidates(updatedCandidates);
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
  const MONTHS = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ];
  
  const formatDateTime = (dt?: string) => {
  if (!dt) return '';
  const [datePart, timePart = '00:00'] = dt.split('T');
  const [year, mo, da] = datePart.split('-').map(Number);
  let [h, m] = timePart.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${MONTHS[mo-1]} ${da}, ${year} at ${h}:${String(m).padStart(2,'0')} ${ampm}`;
};

  

  const formatDate = (d?: string) => {
    if (!d) return '';
    const [year, month, day] = d.split('T')[0].split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
  };
    

  const getModalTitle = (c: Candidate) => {
    switch (c.taskType) {
      case 'interview':
        return `Interview Support — ${c.jobTitle || 'Role'}`;
      case 'assessment':
        return `Assessment Support — Due ${formatDate(c.assessmentDeadline)}`;
      case 'mock':
        return `Mock Interview — ${c.mockMode || 'Session'}`;
      case 'resumeUnderstanding':
        return `Resume Understanding`;
      case 'resumeReview':
        return `Resume Review`;
      default:
        return `Candidate Details`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TabNavigation 
          activeTab={activeTab} 
          onChange={setActiveTab}
          tabs={[
            { id: 'new', label: 'Add Candidate', icon: Plus },
            { id: 'scheduled', label: 'Scheduled', icon: CalendarClock, 
              badge: candidates.length > 0 ? candidates.length : undefined 
            }
          ]}
        />
        
        <div className="mt-6 transition-all duration-200">
          {activeTab === 'new' && (
            <>
              {isAnalyzing && <LoadingOverlay />}
              {analysisError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
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
                    label: "Add Candidate",
                    onClick: () => setActiveTab('new')
                  }}
                />
              ) : (
                <CandidateTimeline
                  candidates={candidates}
                  onView={setViewingCandidate}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  menuOpenId={menuOpenId}
                  setMenuOpenId={setMenuOpenId}
                  formatDate={formatDate}
                  formatDateTime={formatDateTime}
                />
              )}
            </>
          )}
        </div>
      </main>

      {showSuccessModal && submittedCandidate && (
        <DetailModal
          candidate={submittedCandidate}
          title={getModalTitle(submittedCandidate)}
          subtitle={`${submittedCandidate.name} - ${submittedCandidate.technology}`}
          onClose={() => setShowSuccessModal(false)}
          formatDateTime={formatDateTime}
          formatDate={formatDate}
        />
      )}

      {viewingCandidate && (
        <DetailModal
          candidate={viewingCandidate}
          title={getModalTitle(viewingCandidate)}
          subtitle={`${viewingCandidate.name} - ${viewingCandidate.technology}`}
          onClose={() => setViewingCandidate(null)}
          formatDateTime={formatDateTime}
          formatDate={formatDate}
        />
      )}
      
      <ToastContainer />
    </div>
  );
}