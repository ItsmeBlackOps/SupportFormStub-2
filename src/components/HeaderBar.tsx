import React from 'react';
import { UserRound, Briefcase } from 'lucide-react';

export function HeaderBar() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-600 p-2 rounded-lg">
              <UserRound className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-semibold text-gray-900">
                Support Manager
              </h1>
              <p className="text-sm text-gray-500">
                Manage candidate interviews and assessments
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <Briefcase className="h-4 w-4 mr-1" />
              <span>Support Team</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}