"use client"

import { useState } from "react"
import { type Policy } from "@/types"
import PolicyModal from "@/components/policy-modal"
import { Eye, Calendar, Tag } from "lucide-react"

export default function PoliciesPage() {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [policies] = useState<Policy[]>([]) // Empty state for now

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy)
    setIsModalOpen(true)
  }

  const getStatusColor = (status: Policy["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Draft":
        return "bg-yellow-100 text-yellow-800"
      case "Under Review":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Generated Policies</h1>
        <p className="text-gray-600">Manage your AI-generated compliance policies</p>
      </div>

      {policies.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No policies generated yet</h3>
          <p className="mt-1 text-sm text-gray-500">Upload documents and use the chat feature to generate compliance policies.</p>
          
          <div className="mt-6">
            <a
              href="/audit-planner"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Try Audit Planner & Policy Generator
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy) => (
            <div key={policy.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      policy.status,
                    )}`}
                  >
                    {policy.status}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Tag className="h-3 w-3 mr-1" />
                    {policy.framework}
                  </span>
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-2">{policy.title}</h3>

                <p className="text-sm text-gray-600 mb-4">{policy.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {policy.lastUpdated.toLocaleDateString()}
                  </div>

                  <button
                    onClick={() => handleViewPolicy(policy)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPolicy && (
        <PolicyModal
          policy={selectedPolicy}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedPolicy(null)
          }}
        />
      )}
    </div>
  )
}
