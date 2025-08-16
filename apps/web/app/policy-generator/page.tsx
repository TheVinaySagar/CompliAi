"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileText, 
  Download, 
  Copy, 
  Edit, 
  Save, 
  X, 
  Sparkles, 
  Clock,
  Loader2,
  RefreshCw,
  Target,
  Shield,
  FileCheck,
  CheckCircle,
  ExternalLink,
  AlertCircle,
  BarChart3
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface PolicyProject {
  id: string
  title: string
  framework: string
  prompt: string
  description?: string
  status: 'Draft' | 'Generating' | 'Completed' | 'Failed'
  generated_policy?: {
    content: string
    summary: string
    word_count: number
    generated_at: string
  }
  created_at: string
  updated_at: string
  error_message?: string
}

export default function PolicyGeneratorPage() {
  const [activeStep, setActiveStep] = useState<"define" | "generate" | "export">("define")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState("")
  const [projects, setProjects] = useState<PolicyProject[]>([])
  const [currentProject, setCurrentProject] = useState<PolicyProject | null>(null)
  const [isEditingPolicy, setIsEditingPolicy] = useState(false)
  const [editedPolicyContent, setEditedPolicyContent] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  
  // Form state
  const [projectTitle, setProjectTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFramework, setSelectedFramework] = useState("")
  const [prompt, setPrompt] = useState("")
  
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  // Professional markdown components matching audit planner
  const MarkdownComponents = {
    // Custom code block with styling
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : 'text'

      if (!inline) {
        return (
          <div className="relative rounded-lg overflow-hidden bg-muted my-4 border border-border">
            <div className="flex items-center justify-between px-4 py-2 text-xs bg-muted/50 text-muted-foreground border-b border-border">
              <span className="font-medium">{language}</span>
            </div>
            <div className="p-4 text-sm font-mono text-foreground">
              <pre className="whitespace-pre-wrap overflow-x-auto">
                <code {...props}>{children}</code>
              </pre>
            </div>
          </div>
        )
      }

      return (
        <code className="px-2 py-1 text-sm font-mono rounded bg-muted text-foreground border border-border" {...props}>
          {children}
        </code>
      )
    },

    // Custom styling for different elements
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-bold mt-6 mb-3 text-foreground border-b border-border pb-2">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-base font-semibold mt-3 mb-2 text-foreground">{children}</h4>
    ),
    p: ({ children }: any) => (
      <p className="leading-relaxed text-base mb-3 text-foreground">{children}</p>
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
        className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-colors"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4 bg-primary/5 py-2 rounded-r">
        {children}
      </blockquote>
    ),
    hr: () => (
      <hr className="my-4 border-t border-border" />
    ),
    strong: ({ children }: any) => {
      // Special handling for Framework Alignment
      if (typeof children === 'string' && children.includes('Framework Alignment:')) {
        return (
          <span className="inline-block bg-primary/10 px-2 py-1 rounded text-primary text-sm font-medium my-1">
            {children}
          </span>
        )
      }
      return <strong className="font-semibold text-foreground">{children}</strong>
    },
    em: ({ children }: any) => (
      <em className="italic text-foreground">{children}</em>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-border">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-muted/50">{children}</thead>
    ),
    tbody: ({ children }: any) => (
      <tbody>{children}</tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="border-b border-border">{children}</tr>
    ),
    th: ({ children }: any) => (
      <th className="px-4 py-2 text-left font-semibold text-foreground">{children}</th>
    ),
    td: ({ children }: any) => (
      <td className="px-4 py-2 text-foreground">{children}</td>
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
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const response = await apiClient.getPolicyProjects()
      if (response.success && response.data) {
        setProjects(response.data)
      }
    } catch (error) {
      console.error("Failed to load projects:", error)
    }
  }

  const generatePolicy = async () => {
    if (!projectTitle || !selectedFramework || !prompt) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsGenerating(true)
      setGenerationProgress(10)
      setGenerationStatus("Initializing policy generation...")

      const response = await apiClient.generatePolicyFromPrompt({
        title: projectTitle,
        framework: selectedFramework,
        prompt: prompt,
        description: description
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to start policy generation')
      }

      const projectId = response.data.project_id
      setGenerationProgress(30)
      setGenerationStatus("AI is analyzing your requirements...")

      // Create a temporary project object for the UI
      const newProject: PolicyProject = {
        id: projectId,
        title: projectTitle,
        framework: selectedFramework,
        prompt: prompt,
        description: description,
        status: 'Generating',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setProjects(prev => [newProject, ...prev])
      setCurrentProject(newProject)
      setActiveStep("generate")

      // Poll for completion
      const pollForCompletion = async () => {
        const maxAttempts = 60 // 60 seconds max
        let attempts = 0

        const poll = async () => {
          try {
            setGenerationProgress(30 + (attempts * 2)) // Gradually increase progress
            
            if (attempts < 10) {
              setGenerationStatus("Analyzing compliance requirements...")
            } else if (attempts < 20) {
              setGenerationStatus("Generating policy content...")
            } else if (attempts < 30) {
              setGenerationStatus("Applying framework standards...")
            } else {
              setGenerationStatus("Finalizing policy document...")
            }

            const projectResponse = await apiClient.getPolicyProject(projectId)
            
            if (projectResponse.success && projectResponse.data) {
              const project = projectResponse.data
              
              if (project.status === 'Completed' && project.generated_policy) {
                // Policy is complete
                const completedProject: PolicyProject = {
                  ...project,
                  status: 'Completed'
                }

                setCurrentProject(completedProject)
                setProjects(prev => 
                  prev.map(p => p.id === projectId ? completedProject : p)
                )
                setGenerationProgress(100)
                setGenerationStatus("Policy generation completed!")

                toast({
                  title: "Policy Generated Successfully",
                  description: "Your policy has been created and is ready for review."
                })

                return true // Stop polling
              } else if (project.status === 'Failed') {
                // Generation failed
                const errorProject: PolicyProject = {
                  ...newProject,
                  status: 'Failed',
                  error_message: project.error_message
                }
                
                setCurrentProject(errorProject)
                setProjects(prev => 
                  prev.map(p => p.id === projectId ? errorProject : p)
                )

                toast({
                  title: "Generation Failed",
                  description: project.error_message || "There was an error generating your policy.",
                  variant: "destructive"
                })

                return true // Stop polling
              }
            }

            attempts++
            if (attempts >= maxAttempts) {
              throw new Error('Timeout waiting for policy generation')
            }

            // Continue polling
            setTimeout(poll, 1000)
            return false
          } catch (error) {
            console.error('Polling error:', error)
            attempts++
            if (attempts >= maxAttempts) {
              throw error
            }
            setTimeout(poll, 1000)
            return false
          }
        }

        return poll()
      }

      await pollForCompletion()

    } catch (error) {
      console.error('Policy generation error:', error)
      
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "There was an error generating your policy. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
      setGenerationStatus("")
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
        const response = await apiClient.updatePolicyContent(currentProject.id, editedPolicyContent)
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to save changes')
        }

        const updatedProject: PolicyProject = {
          ...currentProject,
          generated_policy: {
            ...currentProject.generated_policy!,
            content: editedPolicyContent,
            word_count: editedPolicyContent.split(/\s+/).length
          }
        }
        
        setCurrentProject(updatedProject)
        setProjects(prev => 
          prev.map(p => p.id === currentProject.id ? updatedProject : p)
        )
        setIsEditingPolicy(false)
        
        toast({
          title: "Changes Saved",
          description: "Your policy edits have been saved successfully."
        })
      } catch (error) {
        console.error('Failed to save edits:', error)
        toast({
          title: "Save Failed",
          description: error instanceof Error ? error.message : "Failed to save changes. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  const cancelEditingPolicy = () => {
    setIsEditingPolicy(false)
    setEditedPolicyContent("")
  }

  const copyToClipboard = async () => {
    if (currentProject?.generated_policy?.content) {
      try {
        await navigator.clipboard.writeText(currentProject.generated_policy.content)
        toast({
          title: "Copied to Clipboard",
          description: "Policy content has been copied to your clipboard."
        })
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
        toast({
          title: "Copy Failed",
          description: "Failed to copy content to clipboard.",
          variant: "destructive"
        })
      }
    }
  }

  const exportToPDF = async () => {
    if (!currentProject?.id) return
    
    setIsExporting(true)
    
    try {
      toast({
        title: "Exporting to PDF",
        description: "Your policy document is being prepared for download."
      })

      const response = await apiClient.exportPolicyProject(
        currentProject.id, 
        'pdf',
        { include_metadata: true }
      )

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Export failed')
      }

      // Create download link
      const url = window.URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${currentProject.title.replace(/[^a-zA-Z0-9]/g, '_')}_policy.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Export Completed",
        description: "PDF downloaded successfully."
      })
      
    } catch (error) {
      console.error('PDF export error:', error)
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export PDF. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const exportToWord = async () => {
    if (!currentProject?.id) return
    
    setIsExporting(true)
    
    try {
      toast({
        title: "Exporting to Word",
        description: "Your policy document is being prepared for download."
      })

      const response = await apiClient.exportPolicyProject(
        currentProject.id, 
        'docx',
        { include_metadata: true }
      )

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Export failed')
      }

      // Create download link
      const url = window.URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${currentProject.title.replace(/[^a-zA-Z0-9]/g, '_')}_policy.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Export Completed",
        description: "Word document downloaded successfully."
      })
      
    } catch (error) {
      console.error('Word export error:', error)
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export Word document. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const resetForm = () => {
    setProjectTitle("")
    setDescription("")
    setSelectedFramework("")
    setPrompt("")
    setCurrentProject(null)
    setIsEditingPolicy(false)
    setEditedPolicyContent("")
    setActiveStep("define")
  }

  return (
    <div className="p-4 sm:p-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">Policy Generator</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Generate comprehensive compliance policies. Define your requirements, generate content, and export professional documents.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-2xl mx-auto space-y-4 sm:space-y-0">
          <div className={`flex items-center space-x-2 ${
            activeStep === "define" ? "text-primary" : 
            activeStep === "generate" || activeStep === "export" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              activeStep === "define" ? "bg-primary/10 text-primary" :
              activeStep === "generate" || activeStep === "export" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted"
            }`}>
              {activeStep === "generate" || activeStep === "export" ? <CheckCircle className="w-4 h-4" /> : "1"}
            </div>
            <span className="font-medium text-sm sm:text-base">Define Requirements</span>
          </div>

          <div className="hidden sm:flex flex-1 h-0.5 bg-border mx-4">
            <div className={`h-full transition-all duration-300 ${
              activeStep === "generate" || activeStep === "export" ? "bg-emerald-500 w-full" : "bg-border w-0"
            }`} />
          </div>

          <div className={`flex items-center space-x-2 ${
            activeStep === "generate" ? "text-primary" : 
            activeStep === "export" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              activeStep === "generate" ? "bg-primary/10 text-primary" :
              activeStep === "export" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted"
            }`}>
              {activeStep === "export" ? <CheckCircle className="w-4 w-4" /> : "2"}
            </div>
            <span className="font-medium text-sm sm:text-base">Generate & Review</span>
          </div>

          <div className="hidden sm:flex flex-1 h-0.5 bg-border mx-4">
            <div className={`h-full transition-all duration-300 ${
              activeStep === "export" ? "bg-emerald-500 w-full" : "bg-border w-0"
            }`} />
          </div>

          <div className={`flex items-center space-x-2 ${
            activeStep === "export" ? "text-primary" : "text-muted-foreground"
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              activeStep === "export" ? "bg-primary/10 text-primary" : "bg-muted"
            }`}>
              3
            </div>
            <span className="font-medium text-sm sm:text-base">Export & Implement</span>
          </div>
        </div>
      </div>

      {/* Step 1: Define Requirements */}
      {activeStep === "define" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Step 1: Define Your Policy Requirements</span>
              </CardTitle>
              <CardDescription>
                Provide the basic information for your policy generation project and describe your specific requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Policy Title */}
              <div className="space-y-2">
                <Label htmlFor="policyTitle">Policy Title *</Label>
                <Input
                  id="policyTitle"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g., Data Privacy Policy, Information Security Policy"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your policy objectives and scope..."
                  rows={3}
                />
              </div>

              {/* Framework Selector */}
              <div className="space-y-2">
                <Label htmlFor="framework">Target Compliance Framework *</Label>
                <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the framework for your policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks.map((framework) => (
                      <SelectItem key={framework.id} value={framework.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{framework.name}</span>
                          <span className="text-sm text-muted-foreground">{framework.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Policy Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements">Policy Requirements *</Label>
                <Textarea
                  id="requirements"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what your policy should cover. Include specific requirements, scope, audience, and any particular compliance needs..."
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  Be specific about your organization's needs, industry requirements, and any particular compliance objectives.
                </p>
              </div>

              {/* Generate Button */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={isGenerating}
                  className="w-full sm:w-auto"
                >
                  Reset Form
                </Button>
                <Button 
                  onClick={generatePolicy}
                  disabled={isGenerating || !projectTitle || !selectedFramework || !prompt}
                  className="w-full sm:w-auto sm:min-w-[140px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Policy
                    </>
                  )}
                </Button>
              </div>

              {/* Generation Progress */}
              {isGenerating && (
                <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{generationStatus}</span>
                    <span className="text-muted-foreground">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-3" />
                  <p className="text-xs text-muted-foreground text-center">
                    This may take 1-2 minutes for comprehensive policy generation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Projects */}
          {projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>Recent Projects</span>
                </CardTitle>
                <CardDescription>
                  Continue working on your previous policy generation projects.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projects.slice(0, 3).map((project) => (
                    <div 
                      key={project.id} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => {
                        setCurrentProject(project)
                        setActiveStep(project.status === 'Completed' ? 'export' : 'generate')
                      }}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{project.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{frameworks.find(f => f.id === project.framework)?.name}</span>
                          <span className="hidden sm:inline">•</span>
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
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{currentProject.title}</h2>
              <p className="text-muted-foreground">Framework: {frameworks.find(f => f.id === currentProject.framework)?.name}</p>
            </div>
            <Button variant="outline" onClick={resetForm} className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Start New Policy
            </Button>
          </div>

          {/* Policy Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span>Generation Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary mb-2">
                  {currentProject.status}
                </div>
                <Badge variant={
                  currentProject.status === "Completed" ? "default" :
                  currentProject.status === "Failed" ? "destructive" :
                  currentProject.status === "Generating" ? "secondary" : "outline"
                }>
                  {currentProject.status === "Completed" ? "Ready for Review" :
                   currentProject.status === "Generating" ? "In Progress" :
                   currentProject.status === "Failed" ? "Generation Failed" : "Draft"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                  <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>Word Count</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                  {currentProject.generated_policy?.word_count || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentProject.generated_policy?.word_count ? "Words generated" : "Waiting for content"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  <span>Generated</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-foreground mb-2">
                  {currentProject.generated_policy?.generated_at
                    ? new Date(currentProject.generated_policy.generated_at).toLocaleDateString()
                    : "Not generated yet"}
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentProject.generated_policy?.generated_at
                    ? new Date(currentProject.generated_policy.generated_at).toLocaleTimeString()
                    : "Waiting for generation"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Generated Policy Content */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span>Generated Policy</span>
                </CardTitle>
                {currentProject.status === "Completed" && currentProject.generated_policy && (
                  <div className="flex flex-wrap gap-2">
                    {!isEditingPolicy ? (
                      <>
                        <Button variant="outline" size="sm" onClick={startEditingPolicy} className="flex-1 sm:flex-none">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Policy
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setActiveStep("export")} className="flex-1 sm:flex-none">
                          <Download className="h-4 w-4 mr-2" />
                          Export Policy
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={cancelEditingPolicy} className="flex-1 sm:flex-none">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEditedPolicy} className="flex-1 sm:flex-none">
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <CardDescription>
                AI-generated policy content based on your requirements and selected compliance framework.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentProject.status === "Generating" && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-foreground mb-2">Generating Your Policy</h3>
                    <p className="text-muted-foreground">
                      Our AI is analyzing your requirements and creating a comprehensive policy document.
                    </p>
                  </div>
                </div>
              )}

              {currentProject.status === "Completed" && currentProject.generated_policy && (
                <div className="space-y-4">
                  {isEditingPolicy ? (
                    <Textarea
                      value={editedPolicyContent}
                      onChange={(e) => setEditedPolicyContent(e.target.value)}
                      rows={20}
                      className="font-mono text-sm"
                    />
                  ) : (
                    <div className="prose prose-slate max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={MarkdownComponents}
                      >
                        {currentProject.generated_policy.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}

              {currentProject.status === "Failed" && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-foreground mb-2">Generation Failed</h3>
                    <p className="text-muted-foreground mb-4">
                      {currentProject.error_message || "There was an error generating your policy."}
                    </p>
                    <Button onClick={() => setActiveStep("define")}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {currentProject.status === "Draft" && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-foreground mb-2">Ready to Generate</h3>
                    <p className="text-muted-foreground mb-4">
                      Click the generate button to create your policy content.
                    </p>
                    <Button onClick={() => setActiveStep("define")}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Policy
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Export & Implement */}
      {activeStep === "export" && currentProject && currentProject.status === "Completed" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Policy Generated Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Your policy document is complete and ready for export. Choose your preferred format below.
            </p>
          </div>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span>Export Options</span>
              </CardTitle>
              <CardDescription>
                Download your policy in various formats for distribution and implementation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  onClick={exportToWord}
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <FileText className="h-8 w-8" />
                  )}
                  <span>Export as Word</span>
                  <span className="text-xs text-muted-foreground">For editing & collaboration</span>
                </Button>

                <Button
                  onClick={exportToPDF}
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <FileText className="h-8 w-8" />
                  )}
                  <span>Export as PDF</span>
                  <span className="text-xs text-muted-foreground">For official records</span>
                </Button>

                <Button
                  onClick={copyToClipboard}
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                  disabled={isExporting}
                >
                  <Copy className="h-8 w-8" />
                  <span>Copy to Clipboard</span>
                  <span className="text-xs text-muted-foreground">Raw markdown text</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Policy Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                <span>Policy Information</span>
              </CardTitle>
              <CardDescription>
                Summary of your generated policy for record keeping.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Policy Title:</span>
                    <p className="mt-1">{currentProject.title}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Framework:</span>
                    <p className="mt-1">{frameworks.find(f => f.id === currentProject.framework)?.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Generated:</span>
                    <p className="mt-1">
                      {currentProject.generated_policy?.generated_at
                        ? new Date(currentProject.generated_policy.generated_at).toLocaleString()
                        : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Word Count:</span>
                    <p className="mt-1">{currentProject.generated_policy?.word_count || 0} words</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <span className="font-medium text-muted-foreground">Original Requirements:</span>
                  <p className="mt-1 text-foreground bg-muted p-3 rounded-lg">{currentProject.prompt}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="outline" onClick={resetForm} className="w-full sm:w-auto">
              Create Another Policy
            </Button>
            <Button onClick={() => setActiveStep("generate")} className="w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              Edit This Policy
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
