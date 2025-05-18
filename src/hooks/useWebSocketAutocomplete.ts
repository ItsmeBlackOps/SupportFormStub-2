import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { FormData } from '../types';

export function useWebSocketAutocomplete(setFormData: (data: FormData) => void) {
  const socketRef = useRef<Socket | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;
  const baseDelay = 1000;

  useEffect(() => {
    const handleCandidateSelected = (event: CustomEvent) => {
      const { email, phone, gender, technology, expert } = event.detail;
      console.log('Received candidate data:', event.detail);
      
      setFormData(prev => {
        const updated = {
          ...prev,
          email,
          phone,
          gender,
          technology,
          expert,
          status: 'Pending' // Set default status
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
        console.log('Received subject status update:', data);
        
        const savedCandidates = localStorage.getItem('candidates');
        if (savedCandidates) {
          try {
            const candidates = JSON.parse(savedCandidates);
            
            const updatedCandidates = candidates.map((candidate: any) => {
              if (candidate.technology === data.subject) {
                console.log(`Updating status for ${candidate.name} (${data.subject}) to ${data.status}`);
                return {
                  ...candidate,
                  status: data.status,
                  updatedAt: new Date().toISOString()
                };
              }
              return candidate;
            });

            localStorage.setItem('candidates', JSON.stringify(updatedCandidates));

            const event = new CustomEvent('subjectStatusChanged', {
              detail: {
                subject: data.subject,
                status: data.status
              }
            });
            window.dispatchEvent(event);
          } catch (error) {
            console.error('Error updating subject status:', error);
          }
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
        socketRef.current.disconnect();
      }
    };
  }, [retryCount]);

  return socketRef.current;
}