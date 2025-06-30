"use client"

import { useState } from "react"
import { dummyPolicies, type Policy } from "@/lib/dummy"
import PolicyModal from "@/components/policy-modal"
import { Eye, Calendar, Tag } from "lucide-react"

export default function PoliciesPage() {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dummyPolicies.map((policy) => (
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
