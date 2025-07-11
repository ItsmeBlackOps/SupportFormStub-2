"use client"

import { CalendarRange, ClipboardCheck, UserCheck, FileText, FileEdit, Sparkles } from "lucide-react"
import type { TaskType } from "../types"
import { TASK_TYPE_LABELS } from "../constants"

interface TaskTypeSelectorProps {
  value: TaskType
  onChange: (value: string) => void
}

const taskTypeIcons = {
  interview: CalendarRange,
  assessment: ClipboardCheck,
  mock: UserCheck,
  resumeUnderstanding: FileText,
  resumeReview: FileEdit,
}

export function TaskTypeSelector({ value, onChange }: TaskTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((type) => {
        const Icon = taskTypeIcons[type]
        const isSelected = value === type

        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`
              group relative rounded-2xl border-2 p-6 
              transition-all duration-200 ease-out hover:scale-[1.02]
              ${
                isSelected
                  ? "ring-2 ring-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 shadow-lg"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
              }
            `}
          >
            <div className="flex flex-col items-center text-center h-full">
              <div
                className={`
                  relative p-3 rounded-2xl mb-4 transition-all duration-200
                  ${
                    isSelected
                      ? "bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 shadow-sm"
                      : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-700"
                  }
                `}
              >
                <Icon className="h-7 w-7" />
                {isSelected && (
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
                  </div>
                )}
              </div>
              <span
                className={`
                  text-sm font-semibold leading-tight
                  ${isSelected ? "text-emerald-700" : "text-gray-900 group-hover:text-gray-800"}
                `}
              >
                {TASK_TYPE_LABELS[type]}
              </span>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 opacity-20 blur-sm" />
              </>
            )}

            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-200" />
          </button>
        )
      })}
    </div>
  )
}
