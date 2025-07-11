"use client"
import { UserRound, Briefcase, Users, Calendar } from "lucide-react"

export function HeaderBar() {
  return (
    <header className="bg-white border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gradient-to-r from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-sm">
              <UserRound className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Support Manager</h1>
              <p className="text-sm text-gray-600 mt-0.5">Manage candidate interviews and assessments</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 border border-emerald-200/50">
              <Briefcase className="h-4 w-4" />
              <span>Support Team</span>
            </div>

            <div className="flex items-center gap-1 text-gray-500">
              <div className="bg-gray-50 p-2 rounded-lg">
                <Users className="h-4 w-4" />
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile badge */}
        <div className="md:hidden mt-4">
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 border border-emerald-200/50 w-fit">
            <Briefcase className="h-4 w-4" />
            <span>Support Team</span>
          </div>
        </div>
      </div>
    </header>
  )
}
