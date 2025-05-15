import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { FormData } from '../types';

export function useWebSocketAutocomplete(setFormData: (data: FormData) => void) {
  const socketRef = useRef<Socket | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;
  const baseDelay = 1000; // Start with 1 second delay

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

      // Listen for search responses
      socketRef.current.on('search_response', (data) => {
        try {
          if (Array.isArray(data) && data.length > 0) {
            const item = data[0]; // Use the first item from the response
            setFormData(prev => ({
              ...prev,
              name: item["Candidate Name"] || prev.name,
              phone: item["Contact No"] || prev.phone,
              email: item["Email ID"] || prev.email,
              gender: item["Gender"] || prev.gender,
              technology: item["Technology"] || prev.technology,
            }));

            // Cache the full objects for later lookup
            data.forEach(item => {
              localStorage.setItem(item['Candidate Name'], JSON.stringify(item));
            });
          }
        } catch (error) {
          console.error('Error processing search response:', error);
        }
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
  }, [retryCount, setFormData]);

  return socketRef.current;
}