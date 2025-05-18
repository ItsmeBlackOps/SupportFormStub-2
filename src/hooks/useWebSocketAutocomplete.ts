import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { FormData } from '../types';

const getTitle = (candidate: any) => {
  const name = candidate.name;
  const tech = candidate.technology;
  const formatDateTime = (dt?: string) => {
    if (!dt) return '';
    const [datePart, timePart = '00:00'] = dt.split('T');
    const [year, mo, da] = datePart.split('-').map(Number);
    let [h, m] = timePart.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${MONTHS[mo-1]} ${da}, ${year} at ${h}:${String(m).padStart(2,'0')} ${ampm}`;
  };

  const formatDate = (d?: string) => {
    if (!d) return '';
    const [year, month, day] = d.split('T')[0].split('-');
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${MONTHS[parseInt(month, 10)-1]} ${parseInt(day, 10)}, ${year}`;
  };

  switch (candidate.taskType) {
    case 'interview':
      return `Interview Support - ${name} - ${tech} - ${formatDateTime(candidate.interviewDateTime)}`;
    case 'assessment':
      return `Assessment Support - ${name} - ${tech} - ${formatDate(candidate.assessmentDeadline)}`;
    case 'mock':
      return `Mock Interview - ${name} - ${tech} - ${candidate.mockMode} - ${formatDateTime(candidate.availabilityDateTime)}`;
    case 'resumeUnderstanding':
      return `Resume Understanding - ${name} - ${tech} - ${formatDateTime(candidate.availabilityDateTime)}`;
    case 'resumeReview':
      return `Resume Making - ${name} - ${tech}`;
    default:
      return '';
  }
};

export function useWebSocketAutocomplete(setFormData: (data: FormData) => void) {
  const socketRef = useRef<Socket | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;
  const baseDelay = 1000;

  useEffect(() => {
    const handleCandidateSelected = (event: CustomEvent) => {
      const { email, phone, gender, technology, expert } = event.detail;
      console.log('Candidate selected event:', event.detail);
      console.log('Expert value:', expert);
      
      setFormData(prev => {
        const updated = {
          ...prev,
          email,
          phone,
          gender,
          technology,
          expert: expert || 'No'
        };
        console.log('Updated form data with expert:', updated);
        return updated;
      });
    };

    window.addEventListener('candidateSelected', handleCandidateSelected as EventListener);

    return () => {
      window.removeEventListener('candidateSelected', handleCandidateSelected as EventListener);
    };
  }, [setFormData]);

  const connectSocket = () => {
    try {
      console.log('Attempting to connect socket...');
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      socketRef.current = io('https://mongo.tunn.dev', {
        transports: ['websocket', 'polling'],
        withCredentials: false,
        forceNew: true,
        reconnectionDelay: Math.min(1000 * Math.pow(2, retryCount), 10000),
        reconnectionAttempts: maxRetries - retryCount,
        timeout: 10000,
        path: '/socket.io'
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected successfully:', socketRef.current?.id);
        setRetryCount(0);
      });

      socketRef.current.on('subjectStatusUpdate', (data: { subject: string; status: string }) => {
        console.log('Received subject status update:', data);
        
        try {
          const savedCandidates = localStorage.getItem('candidates');
          if (!savedCandidates) {
            console.log('No candidates found in localStorage');
            return;
          }

          const candidates = JSON.parse(savedCandidates);
          console.log('Current candidates:', candidates);
          
          const updatedCandidates = candidates.map((candidate: any) => {
            const candidateTitle = getTitle(candidate);
            console.log('Comparing titles:', { 
              received: data.subject, 
              generated: candidateTitle 
            });

            if (candidateTitle === data.subject) {
              console.log('Updating status for candidate:', candidate.name);
              return {
                ...candidate,
                status: data.status,
                updatedAt: new Date().toISOString()
              };
            }
            return candidate;
          });

          console.log('Updated candidates:', updatedCandidates);
          localStorage.setItem('candidates', JSON.stringify(updatedCandidates));

          const event = new CustomEvent('subjectStatusChanged', {
            detail: {
              subject: data.subject,
              status: data.status
            }
          });
          console.log('Dispatching status change event:', event.detail);
          window.dispatchEvent(event);
          
        } catch (error) {
          console.error('Error handling subject status update:', error);
        }
      });

      socketRef.current.on('search_response', (data: any) => {
        console.log('Received search response:', data);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
        handleReconnect();
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
        handleReconnect();
      });

    } catch (error) {
      console.error('Error creating socket connection:', error);
      handleReconnect();
    }
  };

  const handleReconnect = () => {
    if (retryCount < maxRetries) {
      const delay = Math.min(baseDelay * Math.pow(2, retryCount), 10000);
      console.log(`Attempting reconnection in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        connectSocket();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  };

  useEffect(() => {
    connectSocket();

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
      }
    };
  }, [retryCount]);

  return socketRef.current;
}