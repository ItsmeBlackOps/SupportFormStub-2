import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fadeIn">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center space-x-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <div>
            <p className="text-lg font-medium text-gray-900">Processing Image</p>
            <p className="text-sm text-gray-500">Analyzing candidate information...</p>
          </div>
        </div>
      </div>
    </div>
  );
}