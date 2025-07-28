"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  type AuditProject, 
  type PolicyGenerationRequest, 
  type ComplianceDashboard,
  type UploadedDocument,
  type ComplianceFramework
} from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download, 
  Copy, 
  RefreshCw,
  Target,
  Shield,
  FileCheck,
  ExternalLink,
  Edit,
  Sparkles,
  BarChart3
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function AuditPlannerPage() {
  const [activeStep, setActiveStep] = useState<"define" | "generate" | "export">("define")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState("")
  const [showTrackedChanges, setShowTrackedChanges] = useState(false)
  const [projects, setProjects] = useState<AuditProject[]>([])
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [currentProject, setCurrentProject] = useState<AuditProject | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  
  // Form state
  const [projectTitle, setProjectTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFramework, setSelectedFramework] = useState("")
  const [selectedDocument, setSelectedDocument] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  // Available frameworks
  const frameworks = [
    { id: "ISO27001", name: "ISO 27001", description: "Information Security Management" },
    { id: "SOC2", name: "SOC 2", description: "Service Organization Controls" },
    { id: "NIST_CSF", name: "NIST CSF", description: "Cybersecurity Framework" },
    { id: "PCI_DSS", name: "PCI DSS", description: "Payment Card Industry" },
    { id: "GDPR", name: "GDPR", description: "General Data Protection Regulation" },
    { id: "HIPAA", name: "HIPAA", description: "Healthcare Information Security" }
  ]

  useEffect(() => {
    loadDocuments()
    loadProjects()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await apiClient.getDocuments()
      if (response.success && response.data) {
        setDocuments(response.data)
      }
    } catch (error) {
      console.error("Failed to load documents:", error)
    }
  }

  const loadProjects = async () => {
    try {
      const response = await apiClient.getAuditProjects()
      if (response.success && response.data) {
        setProjects(response.data)
      }
    } catch (error) {
      console.error("Failed to load projects:", error)
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      console.log("Starting file upload:", file.name, file.type, file.size)
      
      // Check authentication
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to upload documents.",
          variant: "destructive"
        })
        router.push('/login')
        return
      }
      
      setIsGenerating(true)
      
      // Validate file
      if (!file) {
        throw new Error("No file selected")
      }
      
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ]
      
      if (!validTypes.includes(file.type)) {
        throw new Error("Please upload a PDF or Word document (.pdf, .docx, .doc)")
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        throw new Error("File size must be less than 50MB")
      }
      
      const response = await apiClient.uploadDocument(file, file.name)
      console.log("Upload response:", response)
      
      if (response.success && response.data) {
        toast({
          title: "Document uploaded successfully",
          description: "Document is being processed for analysis."
        })
        
        // Reload documents
        await loadDocuments()
        
        // Auto-select the uploaded document
        setSelectedDocument(response.data.document_id)
      } else {
        console.error("Upload failed with response:", response)
        const errorMessage = response.error || "Upload failed"
        
        // Provide specific error messages for common issues
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.")
        } else if (response.status === 413) {
          throw new Error("File too large. Please choose a smaller file.")
        } else if (response.status === 415) {
          throw new Error("Unsupported file type. Please upload a PDF or Word document.")
        } else if (response.status === 0) {
          throw new Error("Network error. Please check your connection.")
        } else {
          throw new Error(errorMessage)
        }
      }
    } catch (error) {
      console.error("Upload error:", error)
      
      let errorMessage = "Unknown error"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    console.log("Files dropped:", files.length)
    
    if (files && files.length > 0) {
      const file = files[0]
      console.log("Processing dropped file:", file.name, file.type)
      handleFileUpload(file)
    } else {
      toast({
        title: "No file detected",
        description: "Please try again or use the browse button.",
        variant: "destructive"
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    console.log("Files selected:", files?.length)
    
    if (files && files.length > 0) {
      const file = files[0]
      console.log("Processing selected file:", file.name, file.type)
      handleFileUpload(file)
      
      // Reset input so same file can be selected again
      e.target.value = ''
    }
  }

  const pollForCompletion = async (projectId: string) => {
    const maxAttempts = 60 // 5 minutes max
    let attempts = 0
    
    setGenerationStatus("Analyzing source document...")
    setGenerationProgress(20)
    
    while (attempts < maxAttempts) {
      try {
        const response = await apiClient.getAuditProject(projectId)
        
        if (response.success && response.data) {
          const project = response.data as AuditProject
          
          // Update progress based on status
          if (project.status === "Generating") {
            const progressSteps = [
              { progress: 30, status: "Mapping framework controls..." },
              { progress: 50, status: "Generating policy content..." },
              { progress: 70, status: "Adding framework citations..." },
              { progress: 90, status: "Finalizing document..." }
            ]
            
            const step = progressSteps[Math.min(Math.floor(attempts / 3), progressSteps.length - 1)]
            setGenerationProgress(step.progress)
            setGenerationStatus(step.status)
          } else if (project.status === "Completed") {
            setGenerationProgress(100)
            setGenerationStatus("Policy generation completed!")
            setCurrentProject(project)
            setProjects(prev => [project, ...prev])
            setActiveStep("generate")
            return
          } else if (project.status === "Failed") {
            throw new Error("Policy generation failed")
          }
          
          // Still generating, wait and try again
          await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
          attempts++
        } else {
          throw new Error("Failed to check project status")
        }
      } catch (error) {
        console.error("Polling error:", error)
        attempts++
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
    
    throw new Error("Policy generation timed out")
  }

  const generatePolicy = async () => {
    if (!projectTitle || !selectedFramework || !selectedDocument) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsGenerating(true)
      
      const request: PolicyGenerationRequest = {
        projectTitle,
        sourceDocumentId: selectedDocument,
        targetFramework: selectedFramework,
        description
      }

      // Call the actual API for policy generation
      const response = await apiClient.generatePolicy({
        project_title: projectTitle,
        source_document_id: selectedDocument,
        target_framework: selectedFramework,
        description
      })

      if (response.success && response.data) {
        // Start polling for completion
        const projectId = response.data.project_id
        await pollForCompletion(projectId)
      } else {
        throw new Error(response.error || "Failed to generate policy")
      }

      toast({
        title: "Policy generated successfully",
        description: "Your audit-ready policy has been created."
      })

    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateMockPolicyContent = () => {
    return `# ${projectTitle}

## 1. PURPOSE AND SCOPE
This policy establishes the framework for information security management in accordance with ${frameworks.find(f => f.id === selectedFramework)?.name} requirements.

## 2. POLICY STATEMENT
Our organization is committed to maintaining the confidentiality, integrity, and availability of all information assets.

**Framework Alignment:** This section satisfies ${selectedFramework}: A.5.1.1 - Information security policies

## 3. ACCESS CONTROL PROCEDURES
Access to information systems shall be controlled and monitored according to business requirements and security policies.

**Framework Alignment:** This section satisfies ${selectedFramework}: A.9.1.1 - Access control policy

## 4. OPERATIONAL PROCEDURES
Documented operating procedures shall be prepared for all IT systems and regularly reviewed for effectiveness.

**Framework Alignment:** This section satisfies ${selectedFramework}: A.12.1.1 - Operational procedures

## 5. RESPONSIBILITIES
- Management: Overall policy oversight and resource allocation
- IT Security Team: Implementation and monitoring
- All Employees: Compliance with policy requirements

## 6. COMPLIANCE AND MONITORING
This policy will be reviewed annually and updated as necessary to maintain compliance with applicable frameworks and regulations.

## 7. ENFORCEMENT
Non-compliance with this policy may result in disciplinary action up to and including termination.

---
*This document was generated by CompliAI Audit Planner and includes explicit framework citations for audit readiness.*`
  }

  const generateMockCitations = () => {
    return [
      {
        controlId: "A.5.1.1",
        controlTitle: "Information security policies",
        framework: selectedFramework,
        section: "Section 2 - Policy Statement",
        description: "Information security policies shall be defined and approved by management",
        policySection: "Purpose and Scope"
      },
      {
        controlId: "A.9.1.1", 
        controlTitle: "Access control policy",
        framework: selectedFramework,
        section: "Section 3 - Access Control",
        description: "An access control policy shall be established and reviewed",
        policySection: "Access Control Procedures"
      }
    ]
  }

  const exportToPDF = async () => {
    if (!currentProject) return
    
    try {
      toast({
        title: "Exporting to PDF",
        description: "Your policy document is being prepared for download."
      })
      
      const response = await apiClient.exportPolicy(currentProject.id, 'pdf', {
        include_citations: true,
        include_audit_trail: true
      })
      
      if (response.success && response.data) {
        // Handle file download
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${currentProject.title}_policy.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Export completed",
          description: "PDF downloaded successfully."
        })
      } else {
        throw new Error(response.error || "Export failed")
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    }
  }

  const exportToWord = async () => {
    if (!currentProject) return
    
    try {
      toast({
        title: "Exporting to Word",
        description: "Your policy document is being prepared for download."
      })
      
      const response = await apiClient.exportPolicy(currentProject.id, 'docx', {
        include_citations: true,
        include_audit_trail: true
      })
      
      if (response.success && response.data) {
        // Handle file download
        const blob = new Blob([response.data], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${currentProject.title}_policy.docx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Export completed",
          description: "Word document downloaded successfully."
        })
      } else {
        throw new Error(response.error || "Export failed")
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = () => {
    if (currentProject?.generatedPolicy?.content) {
      navigator.clipboard.writeText(currentProject.generatedPolicy.content)
      toast({
        title: "Copied to clipboard",
        description: "Policy content has been copied to your clipboard."
      })
    }
  }

  const testApiConnection = async () => {
    try {
      console.log("Testing API connection...")
      const response = await apiClient.getDocuments()
      console.log("API test result:", response)
      
      toast({
        title: response.success ? "API Connection Success" : "API Connection Failed",
        description: response.success 
          ? `Connected successfully. Found ${response.data?.length || 0} documents.`
          : `Error: ${response.error || 'Unknown error'}`,
        variant: response.success ? "default" : "destructive"
      })
    } catch (error) {
      console.error("API test error:", error)
      toast({
        title: "API Connection Failed",
        description: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setProjectTitle("")
    setDescription("")
    setSelectedFramework("")
    setSelectedDocument("")
    setCurrentProject(null)
    setActiveStep("define")
    setIsGenerating(false)
    setGenerationProgress(0)
    setGenerationStatus("")
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Planner & Policy Generator</h1>
        <p className="text-gray-600 mb-6">
          Transform your existing policies into audit-ready, framework-compliant documents with AI-powered analysis and citations.
        </p>

        {/* Progress Indicator */}
        <div className="flex items-center space-x-4 mb-8">
          <div className={`flex items-center space-x-2 ${
            activeStep === "define" ? "text-blue-600" : 
            activeStep === "generate" || activeStep === "export" ? "text-green-600" : "text-gray-400"
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              activeStep === "define" ? "bg-blue-100 text-blue-600" :
              activeStep === "generate" || activeStep === "export" ? "bg-green-100 text-green-600" : "bg-gray-100"
            }`}>
              {activeStep === "generate" || activeStep === "export" ? <CheckCircle className="w-4 h-4" /> : "1"}
            </div>
            <span className="font-medium">Define Project</span>
          </div>

          <div className="flex-1 h-0.5 bg-gray-200">
            <div className={`h-full transition-all duration-300 ${
              activeStep === "generate" || activeStep === "export" ? "bg-green-500 w-full" : "bg-gray-200 w-0"
            }`} />
          </div>

          <div className={`flex items-center space-x-2 ${
            activeStep === "generate" ? "text-blue-600" : 
            activeStep === "export" ? "text-green-600" : "text-gray-400"
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              activeStep === "generate" ? "bg-blue-100 text-blue-600" :
              activeStep === "export" ? "bg-green-100 text-green-600" : "bg-gray-100"
            }`}>
              {activeStep === "export" ? <CheckCircle className="w-4 h-4" /> : "2"}
            </div>
            <span className="font-medium">Generate & Review</span>
          </div>

          <div className="flex-1 h-0.5 bg-gray-200">
            <div className={`h-full transition-all duration-300 ${
              activeStep === "export" ? "bg-green-500 w-full" : "bg-gray-200 w-0"
            }`} />
          </div>

          <div className={`flex items-center space-x-2 ${
            activeStep === "export" ? "text-blue-600" : "text-gray-400"
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              activeStep === "export" ? "bg-blue-100 text-blue-600" : "bg-gray-100"
            }`}>
              3
            </div>
            <span className="font-medium">Export & Implement</span>
          </div>
        </div>
      </div>

      {/* Step 1: Define Your Audit Project */}
      {activeStep === "define" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>Step 1: Define Your Audit Project</span>
              </CardTitle>
              <CardDescription>
                Provide the basic information for your compliance project and upload your source document.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Title */}
              <div className="space-y-2">
                <Label htmlFor="projectTitle">Project Title *</Label>
                <Input
                  id="projectTitle"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g., Q4 Information Security Policy Review"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your audit project objectives..."
                  rows={3}
                />
              </div>

              {/* Framework Selector */}
              <div className="space-y-2">
                <Label htmlFor="framework">Target Compliance Framework *</Label>
                <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the framework for your audit" />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks.map((framework) => (
                      <SelectItem key={framework.id} value={framework.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{framework.name}</span>
                          <span className="text-sm text-gray-500">{framework.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Document Upload/Selection */}
              <div className="space-y-4">
                <Label>Source Document *</Label>
                
                {/* Upload New Document */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
                  } ${isGenerating ? "opacity-50 pointer-events-none" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragOver(true)
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload Your Current Policy
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Drag and drop your existing policy document (PDF, DOCX) or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="fileInput"
                    disabled={isGenerating}
                  />
                  <Button 
                    variant="outline" 
                    disabled={isGenerating}
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Browse Files
                      </>
                    )}
                  </Button>
                </div>

                {/* Or Select Existing Document */}
                {documents.length > 0 ? (
                  <div className="space-y-2">
                    <Label htmlFor="existingDoc">Or select from uploaded documents:</Label>
                    <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an existing document" />
                      </SelectTrigger>
                      <SelectContent>
                        {documents.map((doc, index) => (
                          <SelectItem key={doc.id || `doc-${index}`} value={doc.id || `doc-${index}`}>
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4" />
                              <span>{doc.name}</span>
                              <Badge variant="outline" className="ml-auto">
                                {doc.status}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      No documents uploaded yet. Upload your first document above to get started.
                    </p>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <div className="pt-4 border-t space-y-3">
                {/* Debug Button - Remove this after testing */}
                <Button 
                  onClick={testApiConnection}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  🔧 Test API Connection (Debug)
                </Button>
                
                <Button 
                  onClick={generatePolicy}
                  disabled={!projectTitle || !selectedFramework || !selectedDocument || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Generating Policy...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate Audit-Ready Policy
                    </>
                  )}
                </Button>
                
                {/* Progress Indicator */}
                {isGenerating && (
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{generationStatus}</span>
                      <span className="text-gray-600">{generationProgress}%</span>
                    </div>
                    <Progress value={generationProgress} className="h-3" />
                    <p className="text-xs text-gray-500 text-center">
                      This may take 2-3 minutes for comprehensive analysis and policy generation.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          {projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span>Recent Projects</span>
                </CardTitle>
                <CardDescription>
                  Continue working on your previous audit planning projects.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projects.slice(0, 3).map((project) => (
                    <div 
                      key={project.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => {
                        setCurrentProject(project)
                        setActiveStep("generate")
                      }}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                          <span>{project.framework}</span>
                          <span>•</span>
                          <span>
                            {project.updatedAt 
                              ? new Date(project.updatedAt).toLocaleDateString()
                              : 'No date'
                            }
                          </span>
                          <Badge variant={
                            project.status === "Completed" ? "default" :
                            project.status === "Failed" ? "destructive" :
                            project.status === "Generating" ? "secondary" : "outline"
                          }>
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                  
                  {projects.length > 3 && (
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View All Projects ({projects.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 2: Generate & Review */}
      {activeStep === "generate" && currentProject && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{currentProject.title}</h2>
              <p className="text-gray-600">Framework: {currentProject.framework}</p>
            </div>
            <Button variant="outline" onClick={resetForm}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Start New Project
            </Button>
          </div>

          {/* Compliance Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Compliance Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {currentProject.complianceScore}%
                </div>
                <Progress value={currentProject.complianceScore} className="h-2" />
                <p className="text-sm text-gray-600 mt-2">
                  Based on framework requirements analysis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>Covered Controls</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {currentProject.coveredControls?.length || 0}
                </div>
                <div className="space-y-1">
                  {(currentProject.coveredControls || []).slice(0, 3).map((control, index) => (
                    <Badge key={`covered-${index}-${control}`} variant="outline" className="mr-1">
                      {control}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Controls identified in your document
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span>Missing Controls</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600 mb-2">
                  {currentProject.missingControls?.length || 0}
                </div>
                <div className="space-y-1">
                  {(currentProject.missingControls || []).slice(0, 3).map((control, index) => (
                    <Badge key={`missing-${index}-${control}`} variant="destructive" className="mr-1">
                      {control}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Gaps addressed in generated policy
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Policy Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  <span>Generated Policy Document</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {currentProject.generatedPolicy?.wordCount} words
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTrackedChanges(!showTrackedChanges)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {showTrackedChanges ? "Hide" : "Show"} Changes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveStep("export")}
                  >
                    Export Options
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Your audit-ready policy with framework citations. You can edit the content below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                {showTrackedChanges ? (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 mb-3 flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-200 rounded"></div>
                        <span>AI Generated Content</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-blue-200 rounded"></div>
                        <span>Framework Citations</span>
                      </div>
                    </div>
                    <div 
                      className="whitespace-pre-wrap font-mono text-sm"
                      dangerouslySetInnerHTML={{
                        __html: (currentProject.generatedPolicy?.content || '')
                          .replace(/\*\*Framework Alignment:\*\*/g, '<span class="bg-blue-200 px-1 rounded"><strong>Framework Alignment:</strong></span>')
                          .replace(/(## \d+\. [A-Z\s]+)/g, '<span class="bg-green-200 px-1 rounded font-semibold">$1</span>')
                      }}
                    />
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {currentProject.generatedPolicy?.content}
                  </pre>
                )}
              </div>

              {/* Framework Citations */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Framework Citations</h4>
                <div className="space-y-2">
                  {(currentProject.generatedPolicy?.citations || []).map((citation, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge>{citation.controlId}</Badge>
                          <span className="font-medium">{citation.controlTitle}</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{citation.description}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Referenced in: {citation.policySection}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Export & Implement */}
      {activeStep === "export" && currentProject && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Policy Generated Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your audit-ready policy is complete with framework citations. Choose your export format below.
            </p>
          </div>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-blue-600" />
                <span>Export Options</span>
              </CardTitle>
              <CardDescription>
                Download your policy in various formats for distribution and implementation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={exportToWord}
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <FileText className="h-8 w-8" />
                  <span>Download as .DOCX</span>
                  <span className="text-xs text-gray-500">For editing & collaboration</span>
                </Button>

                <Button
                  onClick={exportToPDF}
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <FileText className="h-8 w-8" />
                  <span>Download as .PDF</span>
                  <span className="text-xs text-gray-500">For official records</span>
                </Button>

                <Button
                  onClick={copyToClipboard}
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <Copy className="h-8 w-8" />
                  <span>Copy to Clipboard</span>
                  <span className="text-xs text-gray-500">For quick pasting</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span>Audit Trail</span>
              </CardTitle>
              <CardDescription>
                Governance metadata for your compliance records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Project Title:</span>
                    <p>{currentProject.title}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Framework:</span>
                    <p>{currentProject.framework}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Generation Date:</span>
                    <p>
                      {currentProject.generatedPolicy?.generatedAt 
                        ? new Date(currentProject.generatedPolicy.generatedAt).toLocaleString()
                        : 'Not generated yet'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Document Version:</span>
                    <p>v1.0</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Activity Log</h4>
                  <div className="space-y-2">
                    {(currentProject.auditTrail || []).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">{entry.action}</span>
                          <span className="text-gray-600 ml-2">{entry.details}</span>
                        </div>
                        <span className="text-gray-500">
                          {entry.timestamp 
                            ? new Date(entry.timestamp).toLocaleString()
                            : 'No timestamp'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={resetForm}>
              Create Another Policy
            </Button>
            <Button onClick={() => router.push('/policies')}>
              View All Policies
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
