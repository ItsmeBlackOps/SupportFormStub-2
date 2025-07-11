"use client"

import type React from "react"
import { CalendarClock, Plus, Sparkles } from 'lucide-react'
import type { Action } from "../types"

interface EmptyStateProps {
  title: string
  description: string
  action?: Action
  icon?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  action,
  icon = <CalendarClock className="h-12 w-12 text-emerald-400" aria-hidden="true" />,
}: EmptyStateProps) {
  return (
    <div className="text-center  py-16 px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-sm border border-gray-200/60 animate-in fade-in-50 duration-500">
      <div className="flex justify-center mb-6">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl inline-flex ring-1 ring-emerald-200/50">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white max-w-md mx-auto leading-relaxed">{description}</p>

      {action && (
        <div className="mt-8">
          <button
            type="button"
            onClick={action.onClick}
            className="group inline-flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            {action.label}
            <Sparkles className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        </div>
      )}
    </div>
  )
}
