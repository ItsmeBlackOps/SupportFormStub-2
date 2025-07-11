"use client"

import type React from "react"

interface FormSectionProps {
  title: string
  children: React.ReactNode
  icon?: React.ReactNode
  description?: string
}

export function FormSection({ title, children, icon, description }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      </div>
      <div className="pl-0">{children}</div>
    </div>
  )
}
