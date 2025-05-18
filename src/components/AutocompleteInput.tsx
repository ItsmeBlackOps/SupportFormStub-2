import React, { useState, useCallback, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';

interface AutocompleteInputProps {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  onOptionSelect: (option: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: 'text' | 'email' | 'tel';
  pattern?: string;
  className?: string;
}

export function AutocompleteInput({
  id,
  label,
  value,
  options,
  onChange,
  onOptionSelect,
  onBlur,
  required = false,
  type = 'text',
  pattern,
  className = '',
}: AutocompleteInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number>(-1);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const socketRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (id === 'name') {
      socketRef.current = io('https://mongo.tunn.dev', {
        transports: ['websocket'],
        withCredentials: false,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 5000
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id);
      });

      socketRef.current.on('search_response', (data: any[]) => {
        setSearchResults(data);
        setIsLoading(false);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [id]);

  useEffect(() => {
    if (showDropdown && focusedOptionIndex >= 0 && dropdownRef.current) {
      const activeOption = dropdownRef.current.children[focusedOptionIndex] as HTMLElement;
      if (activeOption) {
        activeOption.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedOptionIndex, showDropdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (id === 'name') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (newValue.length >= 2) {
        setIsLoading(true);
        debounceTimerRef.current = setTimeout(() => {
          if (socketRef.current?.connected) {
            socketRef.current.emit('search', { prefix: newValue });
          }
        }, 150); // Debounce delay
      } else {
        setSearchResults([]);
        setIsLoading(false);
      }
    }
  };

  const handleOptionSelect = (option: string) => {
    onOptionSelect(option);
    
    if (id === 'name') {
      const selectedCandidate = searchResults.find(r => r['Candidate Name'] === option);
      if (selectedCandidate) {
        const event = new CustomEvent('candidateSelected', {
          detail: {
            email: selectedCandidate['Email ID'] || '',
            phone: selectedCandidate['Contact No'] || '',
            gender: selectedCandidate['Gender'] || '',
            technology: selectedCandidate['Technology'] || '',
            expert: selectedCandidate['Expert'] || 'No'
          }
        });
        window.dispatchEvent(event);
      }
    }
  };

  const displayOptions = id === 'name' 
    ? searchResults.map(r => r['Candidate Name'])
    : options.filter(option => 
        option.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!displayOptions.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedOptionIndex(prev =>
          prev < displayOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedOptionIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        if (focusedOptionIndex >= 0) {
          e.preventDefault();
          handleOptionSelect(displayOptions[focusedOptionIndex]);
          setShowDropdown(false);
          setFocusedOptionIndex(-1);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setFocusedOptionIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        if (focusedOptionIndex >= 0) {
          e.preventDefault();
          handleOptionSelect(displayOptions[focusedOptionIndex]);
        }
        setShowDropdown(false);
        setFocusedOptionIndex(-1);
        break;
    }
  }, [displayOptions, focusedOptionIndex, handleOptionSelect]);

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative mt-1">
        <input
          ref={inputRef}
          type={type}
          id={id}
          required={required}
          pattern={pattern}
          className={`block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
            focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
            transition-all duration-200 ${className}`}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setShowDropdown(true);
            if (value && displayOptions.length > 0) {
              setFocusedOptionIndex(0);
            }
          }}
          onBlur={(e) => {
            setTimeout(() => setShowDropdown(false), 150);
            onBlur?.(e);
          }}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-activedescendant={
            focusedOptionIndex >= 0 ? `${id}-option-${focusedOptionIndex}` : undefined
          }
        />
        
        {showDropdown && (isLoading || displayOptions.length > 0) && (
          <ul
            ref={dropdownRef}
            id={`${id}-listbox`}
            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base
              overflow-auto focus:outline-none sm:text-sm animate-fadeIn"
            role="listbox"
          >
            {isLoading ? (
              <li className="px-3 py-2 text-sm text-gray-500">Loading...</li>
            ) : (
              displayOptions.map((option, index) => (
                <li
                  key={option}
                  id={`${id}-option-${index}`}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 transition-colors duration-150
                    ${index === focusedOptionIndex ? 'bg-indigo-50 text-indigo-900' : 'text-gray-900 hover:bg-gray-50'}`}
                  role="option"
                  aria-selected={index === focusedOptionIndex}
                  onClick={() => {
                    handleOptionSelect(option);
                    setShowDropdown(false);
                    setFocusedOptionIndex(-1);
                  }}
                >
                  {option}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}