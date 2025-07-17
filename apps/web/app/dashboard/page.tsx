"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"

export default function DashboardPage() {
  const { user } = useAuth()
  const [documentsCount, setDocumentsCount] = useState(0)
  const [controlsCount, setControlsCount] = useState(0)
  const [complianceProgress, setComplianceProgress] = useState(0)
  const [activePolicies, setActivePolicies] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Load dashboard statistics
  useEffect(() => {
    loadDocumentStats()
  }, [])

  const loadDocumentStats = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getDocuments()
      
      if (response.success && response.data) {
        const documents = response.data
        setDocumentsCount(documents.length)
        
        // Calculate total controls mapped from all documents
        const totalControls = documents.reduce((sum: number, doc: any) => {
          return sum + (doc.controls_identified || 0)
        }, 0)
        setControlsCount(totalControls)
        
        // Calculate total policies extracted from all documents
        const totalPolicies = documents.reduce((sum: number, doc: any) => {
          return sum + (doc.policies_extracted || 0)
        }, 0)
        setActivePolicies(totalPolicies)
        
        // Calculate compliance progress (simplified calculation)
        // If we have documents, show progress based on processed vs total
        const processedDocs = documents.filter((doc: any) => doc.status === "processed" || doc.status === "success").length
        const progress = documents.length > 0 ? Math.round((processedDocs / documents.length) * 100) : 0
        setComplianceProgress(progress)
        
      } else {
        console.error("Failed to load documents:", response.error)
        setDocumentsCount(0)
        setControlsCount(0)
        setActivePolicies(0)
        setComplianceProgress(0)
      }
    } catch (error) {
      console.error("Error loading document stats:", error)
      setDocumentsCount(0)
      setControlsCount(0)
      setActivePolicies(0)
      setComplianceProgress(0)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600">Here's an overview of your compliance status.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📄</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Documents Uploaded</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {isLoading ? "..." : documentsCount}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">
                {documentsCount === 0 ? "Upload documents to get started" : `${documentsCount} document${documentsCount === 1 ? '' : 's'} processed`}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Controls Mapped</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {isLoading ? "..." : controlsCount}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">
                {controlsCount === 0 ? "Controls will appear after document processing" : `${controlsCount} control${controlsCount === 1 ? '' : 's'} identified`}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Compliance Progress</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {isLoading ? "..." : `${complianceProgress}%`}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">
                {complianceProgress === 0 ? "Upload documents to track progress" : `${complianceProgress}% of documents processed`}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Policies Extracted</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {isLoading ? "..." : activePolicies}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">
                {activePolicies === 0 ? "Policies will be extracted from documents" : `${activePolicies} polic${activePolicies === 1 ? 'y' : 'ies'} extracted`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a href="/upload" className="block w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-md transition-colors">
                📤 Upload New Document
              </a>
              <a href="/chat" className="block w-full bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-md transition-colors">
                💬 Ask Compliance Questions
              </a>
              <a href="/mapping" className="block w-full bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-md transition-colors">
                🗺️ View Control Mappings
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            {documentsCount === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-3">No activity yet</p>
                <p className="text-xs text-gray-400">Upload your first document to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <span className="text-gray-600">
                    {documentsCount} document{documentsCount === 1 ? '' : 's'} uploaded
                  </span>
                </div>
                {controlsCount > 0 && (
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span className="text-gray-600">
                      {controlsCount} control{controlsCount === 1 ? '' : 's'} mapped
                    </span>
                  </div>
                )}
                {activePolicies > 0 && (
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    <span className="text-gray-600">
                      {activePolicies} polic{activePolicies === 1 ? 'y' : 'ies'} extracted
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
