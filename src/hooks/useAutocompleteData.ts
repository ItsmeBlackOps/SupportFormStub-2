import { useState, useEffect, useCallback } from 'react';
import { Candidate, AutocompleteData } from '../types';

export function useAutocompleteData(initialCandidates: Candidate[] = []) {
  const [autocompleteData, setAutocompleteData] = useState<AutocompleteData>({
    names: new Set(),
    genders: new Set(),
    technologies: new Set(),
    emails: new Set(),
    phones: new Set(),
  });

  // Build autocomplete data from candidates
  const buildAutocompleteData = useCallback((candidates: Candidate[]): AutocompleteData => {
    const data: AutocompleteData = {
      names: new Set(),
      genders: new Set(),
      technologies: new Set(),
      emails: new Set(),
      phones: new Set(),
    };
    
    candidates.forEach(c => {
      if (c.name) data.names.add(c.name);
      if (c.gender) data.genders.add(c.gender);
      if (c.technology) data.technologies.add(c.technology);
      if (c.email) data.emails.add(c.email);
      if (c.phone) data.phones.add(c.phone);
    });
    
    return data;
  }, []);

  // Initialize autocomplete data
  useEffect(() => {
    setAutocompleteData(buildAutocompleteData(initialCandidates));
  }, [initialCandidates, buildAutocompleteData]);

  // Update autocomplete data with new candidates
  const updateAutocompleteData = useCallback((candidates: Candidate[]) => {
    setAutocompleteData(buildAutocompleteData(candidates));
  }, [buildAutocompleteData]);

  return { autocompleteData, updateAutocompleteData };
}