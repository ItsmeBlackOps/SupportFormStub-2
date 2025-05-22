import { useEffect, useRef } from 'react';
import { Candidate } from '../types';

export function useInterviewNotifications(candidates: Candidate[]) {
  const notifiedInterviewsRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  useEffect(() => {
    const checkUpcomingInterviews = () => {
      const now = new Date();
      // Get NY time
      const nyTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));

      candidates.forEach(candidate => {
        if (candidate.taskType !== 'interview' || !candidate.interviewDateTime) return;

        const interviewTime = new Date(candidate.interviewDateTime);
        const minutesUntilInterview = Math.floor((interviewTime.getTime() - nyTime.getTime()) / (1000 * 60));

        // Check for 45-minute warning for pending status
        if (minutesUntilInterview === 45 && 
            (!candidate.status || candidate.status.toLowerCase() === 'pending') && 
            !notifiedInterviewsRef.current.has(`${candidate.id}-45`)) {
          
          notifiedInterviewsRef.current.add(`${candidate.id}-45`);
          
          if (audioRef.current) {
            audioRef.current.play().catch(console.error);
          }

          window.dispatchEvent(new CustomEvent('showToast', {
            detail: {
              message: `⚠️ ${candidate.name}'s interview is starting in 45 minutes and is still pending!`,
              type: 'warning'
            }
          }));
        }

        // Check for 30-minute warning for all interviews
        if (minutesUntilInterview === 30 && !notifiedInterviewsRef.current.has(`${candidate.id}-30`)) {
          notifiedInterviewsRef.current.add(`${candidate.id}-30`);
          
          if (audioRef.current) {
            audioRef.current.play().catch(console.error);
          }

          window.dispatchEvent(new CustomEvent('showToast', {
            detail: {
              message: `🕒 ${candidate.name}'s interview is starting in 30 minutes!`,
              type: 'info'
            }
          }));
        }
      });
    };

    // Check every minute
    const intervalId = setInterval(checkUpcomingInterviews, 60000);
    // Also check immediately on mount or candidates change
    checkUpcomingInterviews();

    return () => clearInterval(intervalId);
  }, [candidates]);
}