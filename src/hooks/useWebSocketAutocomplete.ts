import { useEffect, useRef } from 'react';
import { FormData } from '../types';

export function useWebSocketAutocomplete(setFormData: (data: FormData) => void) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    wsRef.current = new WebSocket('wss://mongo.tunn.dev');

    // Connection opened
    wsRef.current.addEventListener('open', () => {
      console.log('Connected to WebSocket server');
    });

    // Listen for messages
    wsRef.current.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        setFormData(prev => ({
          ...prev,
          name: data["Candidate Name"] || prev.name,
          phone: data["Contact No"] || prev.phone,
          email: data["Email ID"] || prev.email,
          gender: data["Gender"] || prev.gender,
          technology: data["Technology"] || prev.technology,
        }));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    // Handle errors
    wsRef.current.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [setFormData]);

  return wsRef.current;
}