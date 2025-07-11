"use client"

import type React from "react"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in-0 duration-300">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full ${sizeClasses[size]} transform rounded-2xl bg-white shadow-2xl transition-all animate-in slide-in-from-bottom-4 duration-300`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200/60 px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-2xl">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="group rounded-xl p-2 hover:bg-white/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">{children}</div>

          {/* Optional Footer Space */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200/60 rounded-b-2xl">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
