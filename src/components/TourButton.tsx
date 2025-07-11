"use client"

import type React from "react"
import { HelpCircle, RotateCcw, Sparkles } from "lucide-react"
import { useTour } from "../hooks/useTour"

interface TourButtonProps {
  variant?: "primary" | "secondary"
  className?: string
}

export const TourButton: React.FC<TourButtonProps> = ({ variant = "primary", className = "" }) => {
  const { startMainTour, hasCompletedTour, resetTour } = useTour()

  const handleStartTour = () => {
    startMainTour()
  }

  const handleResetAndStartTour = () => {
    resetTour()
    setTimeout(() => {
      startMainTour()
    }, 100)
  }

  const isCompleted = hasCompletedTour()

  if (variant === "secondary") {
    return (
      <button
        onClick={handleStartTour}
        className={`
          group inline-flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium 
          text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 
          rounded-xl border border-gray-600 hover:border-gray-500
          transition-all duration-200 ease-out shadow-sm hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900
          ${className}
        `}
        title="Take a guided tour"
      >
        <HelpCircle className="h-4 w-4 text-gray-400 group-hover:text-gray-300 transition-colors duration-200" />
        <span>Guide Me</span>
      </button>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={handleStartTour}
        className={`
          group relative inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium 
          rounded-xl transition-all duration-200 ease-out shadow-sm hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900
          ${
            isCompleted
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          }
        `}
        title={isCompleted ? "Retake the guided tour" : "Take a guided tour of the application"}
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        <div className="relative flex items-center gap-2.5">
          {isCompleted ? <Sparkles className="h-4 w-4" /> : <HelpCircle className="h-4 w-4" />}
          <span className="font-medium">{isCompleted ? "Retake Tour" : "Take Tour"}</span>
        </div>
      </button>

      {isCompleted && (
        <button
          onClick={handleResetAndStartTour}
          className={`
            group inline-flex items-center gap-2 px-3 py-2 text-xs font-medium 
            text-gray-400 hover:text-gray-200 bg-gray-800 hover:bg-gray-700 
            rounded-lg border border-gray-600 hover:border-gray-500
            transition-all duration-200 ease-out shadow-sm hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900
          `}
          title="Reset tour progress and start over"
        >
          <RotateCcw className="h-3 w-3 text-gray-500 group-hover:text-gray-400 transition-colors duration-200" />
          <span>Reset</span>
        </button>
      )}
    </div>
  )
}
