import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { FormData } from '../types';

export function useWebSocketAutocomplete(setFormData: (data: FormData) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Create Socket.IO connection
    socketRef.current = io('https://myapp.tunnelto.dev');

    // Connection opened
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current?.id);
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
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [setFormData]);

  return socketRef.current;
}