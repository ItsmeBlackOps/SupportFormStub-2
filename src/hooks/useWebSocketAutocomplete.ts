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
      console.log('Received candidate data:', event.detail);
      console.log('Expert status:', expert);
      
      setFormData(prev => {
        const updated = {
          ...prev,
          email,
          phone,
          gender,
          technology,
          expert // Store the actual expert value without conversion
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
      // Disconnect existing socket if any
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Create Socket.IO connection with CORS configuration
      socketRef.current = io('https://mongo.tunn.dev', {
        transports: ['websocket', 'polling'],
        withCredentials: false,
        forceNew: true,
        reconnectionDelay: Math.min(1000 * Math.pow(2, retryCount), 10000), // Exponential backoff
        reconnectionAttempts: maxRetries - retryCount,
        timeout: 10000,
        path: '/socket.io'
      });

      // Connection opened
      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current?.id);
        setRetryCount(0); // Reset retry count on successful connection
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
      const delay = Math.min(baseDelay * Math.pow(2, retryCount), 10000); // Exponential backoff with 10s max
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
        socketRef.current.disconnect();
      }
    };
  }, [retryCount]);

  return socketRef.current;
}