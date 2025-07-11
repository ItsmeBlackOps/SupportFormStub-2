"use client"

import type { LucideIcon } from "lucide-react"
import type { TabId } from "../types"

interface Tab {
  id: TabId
  label: string
  icon: LucideIcon
  badge?: number
  "data-tour"?: string
}

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: TabId
  onChange: (tabId: TabId) => void
}

export function TabNavigation({ tabs, activeTab, onChange }: TabNavigationProps) {
  return (
    <div className="w-full">
      {/* Mobile Select Dropdown */}
      <div className="sm:hidden">
        <div className="relative">
          <select
            id="tabs"
            name="tabs"
            className="block w-full appearance-none rounded-xl border-0 bg-gray-800 px-4 py-3 pr-10 text-sm font-medium text-white shadow-sm ring-1 ring-gray-600 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0 focus:ring-offset-gray-900"
            value={activeTab}
            onChange={(e) => onChange(e.target.value as TabId)}
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id} className="py-2 bg-gray-800 text-white">
                {tab.label} {tab.badge ? `(${tab.badge})` : ""}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Desktop Tab Navigation */}
      <div className="hidden sm:block">
        <div className="bg-gray-800 rounded-2xl p-1.5 shadow-sm ring-1 ring-gray-700/50">
          <nav className="flex space-x-1" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => onChange(tab.id)}
                  data-tour={tab["data-tour"]}
                  className={`
                    group relative flex-1 flex items-center justify-center gap-2.5 px-6 py-3 text-sm font-medium rounded-xl
                    transition-all duration-200 ease-out
                    ${
                      isActive
                        ? "bg-gradient-to-r from-[#b41ff2] to-[#41b1e8] text-white shadow-sm ring-1 ring-[#b41ff2]/30"
                        : "text-[#b41ff2] hover:text-[#41b1e8] hover:bg-gray-700/50"
                    }
                  `}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={`
                      h-4 w-4 transition-all duration-200
                      ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-300"}
                    `}
                    aria-hidden="true"
                  />

                  <span className="font-medium">{tab.label}</span>

                  {tab.badge && (
                    <span
                      className={`
                        inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-semibold rounded-full
                        transition-all duration-200
                        ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-gray-700 text-gray-300 group-hover:bg-gray-600 group-hover:text-gray-200"
                        }
                      `}
                    >
                      {tab.badge}
                    </span>
                  )}

                  {/* Active indicator glow effect */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-50" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
