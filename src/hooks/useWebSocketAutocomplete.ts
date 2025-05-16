import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { FormData } from '../types';

export function useWebSocketAutocomplete(setFormData: (data: FormData) => void) {
  const socketRef = useRef<Socket | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const maxRetries = 3; // Reduced from 5 to fail faster
  const baseDelay = 1000;

  useEffect(() => {
    const handleCandidateSelected = (event: CustomEvent) => {
      const { email, phone, gender, technology } = event.detail;
      setFormData(prev => ({
        ...prev,
        email,
        phone,
        gender,
        technology
      }));
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

      setConnectionStatus('connecting');

      socketRef.current = io('https://mongo.tunn.dev', {
        transports: ['websocket'], // Only use WebSocket transport
        withCredentials: false, // Disable credentials to avoid CORS issues
        forceNew: true,
        reconnectionDelay: Math.min(1000 * Math.pow(2, retryCount), 5000), // Cap at 5 seconds
        reconnectionAttempts: maxRetries - retryCount,
        timeout: 10000, // Reduced timeout
        path: '/socket.io',
        autoConnect: true
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected successfully');
        setConnectionStatus('connected');
        setRetryCount(0);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setConnectionStatus('connecting');
        
        if (reason === 'io server disconnect') {
          socketRef.current?.connect();
        }
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket connection error:', error);
        handleReconnect();
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection failed:', error.message);
        handleReconnect();
      });

    } catch (error) {
      console.error('Failed to create socket connection:', error);
      handleReconnect();
    }
  };

  const handleReconnect = () => {
    if (retryCount < maxRetries) {
      const delay = Math.min(baseDelay * Math.pow(2, retryCount), 5000);
      console.log(`Attempting reconnection in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        connectSocket();
      }, delay);
    } else {
      console.error('WebSocket connection failed after maximum retry attempts');
      setConnectionStatus('failed');
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

  return { socket: socketRef.current, connectionStatus };
}