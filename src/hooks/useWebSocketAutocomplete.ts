import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { FormData } from '../types';

export function useWebSocketAutocomplete(setFormData: (data: FormData) => void) {
  const socketRef = useRef<Socket | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;
  const baseDelay = 1000; // Start with 1 second delay

  useEffect(() => {
    // Listen for candidate selection events
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
          expert: expert || 'No' // Ensure we always have a value
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
      
      // Disconnect existing socket if any
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Create Socket.IO connection with CORS configuration
      socketRef.current = io('https://mongo.tunn.dev', {
        transports: ['websocket', 'polling'],
        withCredentials: false,
        forceNew: true,
        reconnectionDelay: Math.min(1000 * Math.pow(2, retryCount), 10000),
        reconnectionAttempts: maxRetries - retryCount,
        timeout: 10000,
        path: '/socket.io'
      });

      // Connection opened
      socketRef.current.on('connect', () => {
        console.log('Socket connected successfully:', socketRef.current?.id);
        setRetryCount(0); // Reset retry count on successful connection
      });

      // Handle subject status updates
      socketRef.current.on('subjectStatusUpdate', (data: { subject: string; status: string }) => {
        console.log('Received subject status update:', data);
        
        try {
          // Get current candidates from localStorage
          const savedCandidates = localStorage.getItem('candidates');
          if (!savedCandidates) {
            console.log('No candidates found in localStorage');
            return;
          }

          const candidates = JSON.parse(savedCandidates);
          console.log('Current candidates:', candidates);
          
          // Update the status for matching candidates
          const updatedCandidates = candidates.map((candidate: any) => {
            if (candidate.technology === data.subject) {
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

          // Save back to localStorage
          localStorage.setItem('candidates', JSON.stringify(updatedCandidates));

          // Dispatch a custom event to notify components
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

      // Handle search responses
      socketRef.current.on('search_response', (data: any) => {
        console.log('Received search response:', data);
      });

      // Handle disconnection
      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      // Handle errors
      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
        handleReconnect();
      });

      // Handle connection errors
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

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
      }
    };
  }, [retryCount]);

  return socketRef.current;
}