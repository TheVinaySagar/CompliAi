"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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
  BarChart3,
  X
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
  const [isEditingPolicy, setIsEditingPolicy] = useState(false)
  const [editedPolicyContent, setEditedPolicyContent] = useState("")
  
  // Form state
  const [projectTitle, setProjectTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFramework, setSelectedFramework] = useState("")
  const [selectedDocument, setSelectedDocument] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  // Professional markdown components like the chat interface
  const MarkdownComponents = {
    // Custom code block with styling
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : 'text'

      if (!inline) {
        return (
          <div className="relative rounded-lg overflow-hidden bg-slate-100 my-4">
            <div className="flex items-center justify-between px-4 py-2 text-xs bg-slate-200 text-slate-600 border-b">
              <span className="font-medium">{language}</span>
            </div>
            <div className="p-4 text-sm font-mono text-slate-800">
              <pre className="whitespace-pre-wrap overflow-x-auto">
                <code {...props}>{children}</code>
              </pre>
            </div>
          </div>
        )
      }

      return (
        <code className="px-2 py-1 text-sm font-mono rounded bg-slate-200 text-slate-800" {...props}>
          {children}
        </code>
      )
    },

    // Custom styling for different elements
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 text-slate-900">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-bold mt-6 mb-3 text-slate-900 border-b border-slate-300 pb-2">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-semibold mt-4 mb-2 text-slate-800">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-base font-semibold mt-3 mb-2 text-slate-800">{children}</h4>
    ),
    p: ({ children }: any) => (
      <p className="leading-relaxed text-base mb-3 text-gray-700">{children}</p>
    ),
    ul: ({ children }: any) => (
      <ul className="space-y-1 ml-4 mb-4 list-disc">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="space-y-1 ml-4 mb-4 list-decimal">{children}</ol>
    ),
    li: ({ children }: any) => (
      <li className="leading-relaxed">{children}</li>
    ),
    a: ({ href, children }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-700 my-4 bg-blue-50/50 py-2 rounded-r">
        {children}
      </blockquote>
    ),
    hr: () => (
      <hr className="my-4 border-t border-slate-300" />
    ),
    strong: ({ children }: any) => {
      // Special handling for Framework Alignment
      if (typeof children === 'string' && children.includes('Framework Alignment:')) {
        return (
          <span className="inline-block bg-blue-100 px-2 py-1 rounded text-blue-800 text-sm font-medium my-1">
            {children}
          </span>
        )
      }
      return <strong className="font-semibold text-slate-900">{children}</strong>
    },
    em: ({ children }: any) => (
      <em className="italic text-slate-700">{children}</em>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-slate-300">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-slate-100">{children}</thead>
    ),
    tbody: ({ children }: any) => (
      <tbody>{children}</tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="border-b border-slate-300">{children}</tr>
    ),
    th: ({ children }: any) => (
      <th className="px-4 py-2 text-left font-semibold text-slate-900">{children}</th>
    ),
    td: ({ children }: any) => (
      <td className="px-4 py-2 text-slate-700">{children}</td>
    ),
  }

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
    const maxAttempts = 120 // 10 minutes max (5 second intervals)
    let attempts = 0
    
    setGenerationStatus("Starting policy generation...")
    setGenerationProgress(10)
    
    while (attempts < maxAttempts) {
      try {
        // Use the new status endpoint for more accurate progress tracking
        const statusResponse = await apiClient.getAuditProjectStatus(projectId)
        
        if (statusResponse.success && statusResponse.data) {
          const status = statusResponse.data
          
          console.log(`Poll attempt ${attempts + 1}: Status=${status.status}, Progress=${status.progress}%`)
          
          // Update progress with real backend progress
          setGenerationProgress(status.progress || 0)
          setGenerationStatus(status.latest_action || status.latest_details || "Processing...")
          
          if (status.status === "COMPLETED") {
            setGenerationProgress(100)
            setGenerationStatus("Policy generation completed!")
            
            console.log("Project completed, fetching full project data...")
            
            // Add a small delay to ensure database is fully updated
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Now get the full project data with retries
            let projectResponse = null
            let retryCount = 0
            const maxRetries = 3
            
            while (retryCount < maxRetries && !projectResponse?.success) {
              console.log(`Fetching project data, attempt ${retryCount + 1}`)
              projectResponse = await apiClient.getAuditProject(projectId)
              
              if (!projectResponse?.success) {
                console.log(`Failed to fetch project, retrying in 1 second...`)
                await new Promise(resolve => setTimeout(resolve, 1000))
                retryCount++
              }
            }
            
            if (projectResponse?.success && projectResponse.data) {
              const project = projectResponse.data as AuditProject
              console.log("Successfully retrieved completed project:", project)
              
              setCurrentProject(project)
              setProjects(prev => {
                // Remove any existing project with same ID and add the updated one
                const filtered = prev.filter(p => p.id !== projectId)
                return [project, ...filtered]
              })
              setActiveStep("generate")
              return // Success - exit polling loop
              
            } else {
              console.error("Failed to retrieve completed project after retries")
              throw new Error("Failed to retrieve completed project data")
            }
            
          } else if (status.status === "FAILED") {
            throw new Error(status.latest_details || "Policy generation failed")
          }
          
          // Still generating, wait and try again
          await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
          attempts++
          
        } else {
          console.error("Status endpoint failed, trying fallback...")
          throw new Error("Failed to check project status")
        }
        
      } catch (error) {
        console.error("Polling error:", error)
        
        // If status endpoint fails, fall back to regular project endpoint
        try {
          console.log("Trying fallback project endpoint...")
          const response = await apiClient.getAuditProject(projectId)
          
          if (response.success && response.data) {
            const project = response.data as AuditProject
            console.log(`Fallback: Project status=${project.status}`)
            
            if (project.status === "Completed") {
              setGenerationProgress(100)
              setGenerationStatus("Policy generation completed!")
              setCurrentProject(project)
              setProjects(prev => {
                const filtered = prev.filter(p => p.id !== projectId)
                return [project, ...filtered]
              })
              setActiveStep("generate")
              return // Success - exit polling loop
              
            } else if (project.status === "Failed") {
              throw new Error("Policy generation failed")
            }
            
            // Update progress with basic time-based estimation
            const timeBasedProgress = Math.min(20 + (attempts * 2), 90)
            setGenerationProgress(timeBasedProgress)
            setGenerationStatus("Generating policy content...")
          }
        } catch (fallbackError) {
          console.error("Fallback polling error:", fallbackError)
        }
        
        attempts++
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
      }
    }
    
    throw new Error("Policy generation timed out after 10 minutes")
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
        const blob = response.data as Blob
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${currentProject.title.replace(/[^a-zA-Z0-9]/g, '_')}_policy.pdf`
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
        const blob = response.data as Blob
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${currentProject.title.replace(/[^a-zA-Z0-9]/g, '_')}_policy.docx`
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
    const contentToCopy = isEditingPolicy ? editedPolicyContent : currentProject?.generated_policy?.content
    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy)
      toast({
        title: "Copied to clipboard",
        description: "Policy content has been copied to your clipboard."
      })
    }
  }

  const startEditingPolicy = () => {
    if (currentProject?.generated_policy?.content) {
      setEditedPolicyContent(currentProject.generated_policy.content)
      setIsEditingPolicy(true)
    }
  }

  const saveEditedPolicy = async () => {
    if (currentProject && editedPolicyContent) {
      try {
        // Update the project in the database
        const response = await apiClient.updateAuditProject(currentProject.id, {
          policy_content: editedPolicyContent
        })

        if (response.success) {
          // Update the current project locally
          const updatedProject = {
            ...currentProject,
            generated_policy: {
              ...currentProject.generated_policy!,
              content: editedPolicyContent,
              word_count: editedPolicyContent.split(/\s+/).length
            }
          }
          setCurrentProject(updatedProject)
          
          // Also update in the projects list
          setProjects(prev => 
            prev.map(p => p.id === currentProject.id ? updatedProject : p)
          )
          
          setIsEditingPolicy(false)
          
          toast({
            title: "Policy updated successfully",
            description: "Your changes have been saved to the database."
          })
        } else {
          throw new Error(response.error || "Failed to update policy")
        }
      } catch (error) {
        console.error("Error saving policy:", error)
        toast({
          title: "Save failed",
          description: error instanceof Error ? error.message : "Failed to save policy changes",
          variant: "destructive"
        })
      }
    }
  }

  const cancelEditingPolicy = () => {
    setIsEditingPolicy(false)
    setEditedPolicyContent("")
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
    setIsEditingPolicy(false)
    setEditedPolicyContent("")
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Planner</h1>
        <p className="text-gray-600">
          Transform your existing policies into audit-ready, framework-compliant documents with AI-powered analysis and citations.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
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

          <div className="flex-1 h-0.5 bg-gray-200 mx-4">
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

          <div className="flex-1 h-0.5 bg-gray-200 mx-4">
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

              {/* Action Buttons */}
              <div className="pt-4 border-t">
                <div className="flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                    disabled={isGenerating}
                  >
                    Reset Form
                  </Button>
                  <Button 
                    onClick={generatePolicy}
                    disabled={!projectTitle || !selectedFramework || !selectedDocument || isGenerating}
                    className="min-w-[140px]"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Policy
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Generation Progress */}
                {isGenerating && (
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg border mt-4">
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
                            {project.updated_at 
                              ? new Date(project.updated_at).toLocaleDateString()
                              : new Date(project.created_at).toLocaleDateString()
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
              Start New Audit
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
                  {currentProject.compliance_score}%
                </div>
                <Progress value={currentProject.compliance_score} className="h-2" />
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
                  {currentProject.covered_controls?.length || 0}
                </div>
                <div className="space-y-1">
                  {(currentProject.covered_controls || []).slice(0, 3).map((control, index) => (
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
                  {currentProject.missing_controls?.length || 0}
                </div>
                <div className="space-y-1">
                  {(currentProject.missing_controls || []).slice(0, 3).map((control, index) => (
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
                    {isEditingPolicy 
                      ? `${editedPolicyContent.split(/\s+/).length} words`
                      : `${currentProject.generated_policy?.word_count} words`
                    }
                  </Badge>
                  {!isEditingPolicy ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={startEditingPolicy}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Policy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTrackedChanges(!showTrackedChanges)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {showTrackedChanges ? "Hide" : "Show"} Changes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveStep("export")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Policy
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelEditingPolicy}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveEditedPolicy}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                {isEditingPolicy 
                  ? "Edit your policy content below. Markdown formatting is supported."
                  : "Your audit-ready policy with framework citations. Click 'Edit Policy' to make changes."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditingPolicy ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">Markdown Formatting Tips:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Use # for main headings, ## for subheadings, ### for sub-subheadings</li>
                      <li>• Use **text** for bold formatting</li>
                      <li>• Use *text* for italic formatting</li>
                      <li>• Use - or * for bullet points</li>
                      <li>• Use 1. 2. 3. for numbered lists</li>
                      <li>• Use `code` for inline code formatting</li>
                      <li>• Leave blank lines between sections for proper spacing</li>
                      <li>• **Framework Alignment:** will be highlighted automatically</li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Editor */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Edit Content</h4>
                      <Textarea
                        value={editedPolicyContent}
                        onChange={(e) => setEditedPolicyContent(e.target.value)}
                        className="min-h-96 font-mono text-sm resize-none"
                        placeholder="Enter your policy content here..."
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Characters: {editedPolicyContent.length}</span>
                        <span>Words: {editedPolicyContent.split(/\s+/).filter(word => word.length > 0).length}</span>
                      </div>
                    </div>
                    
                    {/* Preview */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Preview</h4>
                      <div className="border rounded-lg p-4 bg-white min-h-96 max-h-96 overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={MarkdownComponents}
                          >
                            {editedPolicyContent || "Start typing to see the preview..."}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
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
                          __html: (currentProject.generated_policy?.content || '')
                            .replace(/\*\*Framework Alignment:\*\*/g, '<span class="bg-blue-200 px-1 rounded"><strong>Framework Alignment:</strong></span>')
                            .replace(/(## \d+\. [A-Z\s]+)/g, '<span class="bg-green-200 px-1 rounded font-semibold">$1</span>')
                        }}
                      />
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={MarkdownComponents}
                      >
                        {currentProject.generated_policy?.content || "No policy content available."}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}

              {/* Framework Citations */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Framework Citations</h4>
                <div className="space-y-2">
                  {(currentProject.generated_policy?.citations || []).map((citation, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge>{citation.control_id}</Badge>
                          <span className="font-medium">{citation.control_title}</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{citation.description}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Referenced in: {citation.policy_section}
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
                  <span>Export as Word</span>
                  <span className="text-xs text-gray-500">For editing & collaboration</span>
                </Button>

                <Button
                  onClick={exportToPDF}
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <FileText className="h-8 w-8" />
                  <span>Export as PDF</span>
                  <span className="text-xs text-gray-500">For official records</span>
                </Button>

                <Button
                  onClick={copyToClipboard}
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <Copy className="h-8 w-8" />
                  <span>Copy to Clipboard</span>
                  <span className="text-xs text-gray-500">Raw text content</span>
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
                      {currentProject.generated_policy?.generated_at 
                        ? new Date(currentProject.generated_policy.generated_at).toLocaleString()
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
                    {(currentProject.audit_trail || []).map((entry) => (
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
              Create Another Audit
            </Button>
            <Button onClick={() => setActiveStep("generate")}>
              <Edit className="h-4 w-4 mr-2" />
              Edit This Policy
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}