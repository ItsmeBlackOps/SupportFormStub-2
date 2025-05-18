import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { FormData } from '../types';

export function useWebSocketAutocomplete(setFormData: (data: FormData) => void) {
  const socketRef = useRef<Socket | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;
  const baseDelay = 1000;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for notifications
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  useEffect(() => {
    const handleCandidateSelected = (event: CustomEvent) => {
      const { email, phone, gender, technology, expert } = event.detail;
      console.log('Candidate selected event:', event.detail);
      
      setFormData(prev => {
        const updated = {
          ...prev,
          email,
          phone,
          gender,
          technology,
          expert: expert || 'No'
        };
        console.log('Updated form data:', updated);
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
      console.log('Connecting socket...');
      
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
        console.log('Socket connected:', socketRef.current?.id);
        setRetryCount(0);
      });

      socketRef.current.on('subjectStatusUpdate', (data: { subject: string; status: string }) => {        
        try {
          // Play notification sound
          if (audioRef.current) {
            audioRef.current.play().catch(err => console.error('Error playing sound:', err));
          }

          const savedCandidates = localStorage.getItem('candidates');
          if (!savedCandidates) return;

          const candidates = JSON.parse(savedCandidates);
          
          const updatedCandidates = candidates.map((candidate: any) => {
            if (candidate.subject === data.subject) {
              console.log(`Updating status for: ${candidate.subject}`);
              return {
                ...candidate,
                status: data.status,
                updatedAt: new Date().toISOString()
              };
            }
            return candidate;
          });

          localStorage.setItem('candidates', JSON.stringify(updatedCandidates));

          // Dispatch event for UI updates
          window.dispatchEvent(new CustomEvent('subjectStatusChanged', {
            detail: { subject: data.subject, status: data.status }
          }));

          // Show toast notification
          window.dispatchEvent(new CustomEvent('showToast', {
            detail: {
              message: `Status updated to ${data.status} for ${data.subject}`,
              type: 'info'
            }
          }));
          
        } catch (error) {
          console.error('Error handling status update:', error);
        }
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
      console.error('Socket connection error:', error);
      handleReconnect();
    }
  };

  const handleReconnect = () => {
    if (retryCount < maxRetries) {
      const delay = Math.min(baseDelay * Math.pow(2, retryCount), 10000);
      console.log(`Reconnecting in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      
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
        console.log('Cleaning up socket');
        socketRef.current.disconnect();
      }
    };
  }, [retryCount]);

  return socketRef.current;
}