import { useState, useCallback } from 'react';
import { FormData as CandidateFormData } from '../types';

interface AnalysisError {
  message: string;
  timestamp: number;
}

export function useImagePaste(setFormData: (updater: (prev: CandidateFormData) => CandidateFormData) => void) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<AnalysisError | null>(null);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        setIsAnalyzing(true);
        setError(null);

        const blob = item.getAsFile();
        if (!blob) continue;

        try {
          const formData = new window.FormData();
          formData.append('file', blob, 'pasted-image.png');

          const res = await fetch('https://blackops.tunn.dev/parse-candidate/', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            throw new Error(`Analysis failed: ${res.statusText}`);
          }

          const data = await res.json();
          
          setFormData(prev => ({
            ...prev,
            name: data.candidate_name || prev.name,
            gender: data.gender || prev.gender,
            technology: data.technology || prev.technology,
            email: data.email || prev.email,
            phone: data.contact_number || prev.phone,
          }));
          
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
          setError({
            message: errorMessage,
            timestamp: Date.now(),
          });
        } finally {
          setIsAnalyzing(false);
        }
        break;
      }
    }
  }, [setFormData]);

  return {
    isAnalyzing,
    error,
    handlePaste,
  };
}