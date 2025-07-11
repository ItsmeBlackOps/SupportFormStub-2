"use client"

import { Loader2, ImageIcon } from "lucide-react"

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in-0 duration-300">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
            <Loader2 className="absolute -top-1 -right-1 h-6 w-6 animate-spin text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-gray-900">Processing Image</p>
            <p className="text-sm text-gray-600 mt-1">Analyzing candidate information...</p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-1.5 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
