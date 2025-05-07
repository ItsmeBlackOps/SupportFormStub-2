import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastType } from '../types';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export function useToast(defaultDuration = 3000) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = defaultDuration) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, [defaultDuration]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map(toast => {
      return setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts, removeToast]);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info': default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-green-50';
      case 'error': return 'bg-red-50';
      case 'warning': return 'bg-amber-50';
      case 'info': default: return 'bg-blue-50';
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'border-green-200';
      case 'error': return 'border-red-200';
      case 'warning': return 'border-amber-200';
      case 'info': default: return 'border-blue-200';
    }
  };

  const ToastContainer = () => {
    if (toasts.length === 0) return null;

    return (
      <div className="fixed bottom-0 right-0 p-4 w-full sm:max-w-sm sm:w-auto z-50">
        <div className="space-y-2">
          {toasts.map(toast => (
            <div 
              key={toast.id} 
              className={`flex items-center justify-between p-4 rounded-lg shadow-lg border 
                          ${getBgColor(toast.type)} ${getBorderColor(toast.type)} 
                          animate-slideInRight`}
              role="alert"
            >
              <div className="flex items-center">
                {getIcon(toast.type)}
                <p className="ml-3 text-sm font-medium text-gray-900">{toast.message}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)} 
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return { showToast, removeToast, ToastContainer };
}