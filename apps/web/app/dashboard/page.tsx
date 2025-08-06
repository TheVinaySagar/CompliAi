"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  FileText, 
  Target, 
  BarChart3, 
  CheckCircle, 
  Upload, 
  MessageCircle, 
  Map,
  TrendingUp,
  Clock,
  AlertCircle
} from "lucide-react"

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

  // Loading component for skeleton state
  const StatCardSkeleton = () => (
    <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-3 sm:space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-slate-600 text-sm sm:text-base">
              Here's your compliance overview for today
            </p>
          </div>
          <Badge variant="outline" className="self-start sm:self-center flex items-center gap-1 px-3 py-1 text-xs">
            <Clock className="h-3 w-3" />
            <span className="hidden sm:inline">Last updated:</span> Just now
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 truncate">
                  Documents
                </CardTitle>
                <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {documentsCount}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {documentsCount === 0 ? "Upload your first document" : `${documentsCount} processed`}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 truncate">
                  Controls Mapped
                </CardTitle>
                <Target className="h-4 w-4 text-green-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {controlsCount}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {controlsCount === 0 ? "Ready to map controls" : `${controlsCount} identified`}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 truncate">
                  Compliance Score
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {`${complianceProgress}%`}
                </div>
                <Progress value={complianceProgress} className="mt-2 h-2" />
                <p className="text-xs text-slate-500 mt-1">
                  {complianceProgress === 100 ? "Fully compliant" : "Improvement needed"}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 truncate">
                  Policies
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {activePolicies}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {activePolicies === 0 ? "No policies yet" : `${activePolicies} extracted`}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Get started with common compliance tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto flex-col p-6 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 min-h-[120px]"
              onClick={() => window.location.href = '/upload'}
            >
              <Upload className="h-8 w-8 text-blue-600 mb-2" />
              <span className="font-medium text-center">Upload Document</span>
              <span className="text-xs text-slate-500 mt-1 text-center break-words">Add new compliance docs</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex-col p-6 hover:bg-green-50 hover:border-green-200 transition-all duration-200 min-h-[120px]"
              onClick={() => window.location.href = '/chat'}
            >
              <MessageCircle className="h-8 w-8 text-green-600 mb-2" />
              <span className="font-medium text-center">Ask AI</span>
              <span className="text-xs text-slate-500 mt-1 text-center break-words">Get compliance answers</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex-col p-6 hover:bg-purple-50 hover:border-purple-200 transition-all duration-200 min-h-[120px]"
              onClick={() => window.location.href = '/mapping'}
            >
              <Map className="h-8 w-8 text-purple-600 mb-2" />
              <span className="font-medium text-center">View Mappings</span>
              <span className="text-xs text-slate-500 mt-1 text-center break-words">Explore control maps</span>
            </Button>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documentsCount === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 mb-2">No activity yet</p>
                <p className="text-xs text-slate-400">Upload your first document to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 break-words">
                      Documents Processed
                    </p>
                    <p className="text-xs text-slate-500 break-words">
                      {documentsCount} document{documentsCount === 1 ? '' : 's'} successfully uploaded
                    </p>
                  </div>
                </div>
                
                {controlsCount > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 break-words">
                        Controls Identified
                      </p>
                      <p className="text-xs text-slate-500 break-words">
                        {controlsCount} control{controlsCount === 1 ? '' : 's'} mapped successfully
                      </p>
                    </div>
                  </div>
                )}
                
                {activePolicies > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 break-words">
                        Policies Extracted
                      </p>
                      <p className="text-xs text-slate-500 break-words">
                        {activePolicies} polic{activePolicies === 1 ? 'y' : 'ies'} extracted from documents
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
