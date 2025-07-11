"use client"
import { useState, useEffect, useCallback } from "react"
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react"
import type { ToastType } from "../types"

interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
}

export function useToast(defaultDuration = 4000) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = defaultDuration) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, message, type, duration }])
      return id
    },
    [defaultDuration],
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  useEffect(() => {
    if (toasts.length === 0) return

    const timers = toasts.map((toast) => {
      return setTimeout(() => {
        removeToast(toast.id)
      }, toast.duration)
    })

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [toasts, removeToast])

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-emerald-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-white",
          border: "border-emerald-200",
          ring: "ring-1 ring-emerald-200/50",
          text: "text-emerald-800",
        }
      case "error":
        return {
          bg: "bg-white",
          border: "border-red-200",
          ring: "ring-1 ring-red-200/50",
          text: "text-red-800",
        }
      case "warning":
        return {
          bg: "bg-white",
          border: "border-amber-200",
          ring: "ring-1 ring-amber-200/50",
          text: "text-amber-800",
        }
      case "info":
      default:
        return {
          bg: "bg-white",
          border: "border-blue-200",
          ring: "ring-1 ring-blue-200/50",
          text: "text-blue-800",
        }
    }
  }

  const ToastContainer = () => {
    if (toasts.length === 0) return null

    return (
      <div className="fixed bottom-4 right-4 w-full sm:max-w-md sm:w-auto z-50 pointer-events-none">
        <div className="space-y-3">
          {toasts.map((toast, index) => {
            const styles = getStyles(toast.type)
            return (
              <div
                key={toast.id}
                className={`
                  flex items-start gap-3 p-4 rounded-2xl shadow-lg backdrop-blur-sm
                  ${styles.bg} ${styles.border} ${styles.ring}
                  animate-in slide-in-from-right-full duration-300 pointer-events-auto
                  hover:shadow-xl transition-all
                `}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
                role="alert"
                aria-live="polite"
              >
                <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-relaxed ${styles.text}`}>{toast.message}</p>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return { showToast, removeToast, ToastContainer }
}
