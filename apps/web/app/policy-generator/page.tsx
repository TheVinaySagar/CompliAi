"use client"

import { useState } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Sparkles, 
  Download, 
  Copy, 
  RefreshCw, 
  FileText, 
  Edit, 
  Save, 
  X,
  Wand2,
  Clock,
  CheckCircle2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GeneratedPolicy {
  id: string
  title: string
  content: string
  prompt: string
  framework: string
  generatedAt: Date
  wordCount: number
  status: 'generating' | 'completed' | 'error'
}

export default function PolicyGeneratorPage() {
  const [prompt, setPrompt] = useState("")
  const [selectedFramework, setSelectedFramework] = useState("")
  const [policyTitle, setPolicyTitle] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPolicies, setGeneratedPolicies] = useState<GeneratedPolicy[]>([])
  const [currentPolicy, setCurrentPolicy] = useState<GeneratedPolicy | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState("")
  const { toast } = useToast()

  const frameworks = [
    { id: "ISO27001", name: "ISO 27001", description: "Information Security Management" },
    { id: "SOC2", name: "SOC 2", description: "Service Organization Controls" },
    { id: "NIST_CSF", name: "NIST CSF", description: "Cybersecurity Framework" },
    { id: "PCI_DSS", name: "PCI DSS", description: "Payment Card Industry" },
    { id: "GDPR", name: "GDPR", description: "General Data Protection Regulation" },
    { id: "HIPAA", name: "HIPAA", description: "Healthcare Information Security" },
    { id: "CUSTOM", name: "Custom Policy", description: "General business policy" }
  ]

  // Professional markdown components
  const MarkdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 text-slate-900">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-bold mt-6 mb-3 text-slate-900 border-b border-slate-300 pb-2">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-semibold mt-4 mb-2 text-slate-800">{children}</h3>
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
    strong: ({ children }: any) => (
      <strong className="font-semibold text-slate-900">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-slate-700">{children}</em>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-700 my-4 bg-blue-50/50 py-2 rounded-r">
        {children}
      </blockquote>
    ),
  }

  const generatePolicy = async () => {
    if (!prompt.trim() || !selectedFramework || !policyTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    
    // Create a new policy entry
    const newPolicy: GeneratedPolicy = {
      id: Date.now().toString(),
      title: policyTitle,
      content: "",
      prompt: prompt,
      framework: selectedFramework,
      generatedAt: new Date(),
      wordCount: 0,
      status: 'generating'
    }

    setGeneratedPolicies(prev => [newPolicy, ...prev])
    setCurrentPolicy(newPolicy)

    try {
      // Simulate AI policy generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock generated content based on framework and prompt
      const generatedContent = generateMockPolicy(policyTitle, selectedFramework, prompt)
      
      const completedPolicy: GeneratedPolicy = {
        ...newPolicy,
        content: generatedContent,
        wordCount: generatedContent.split(/\s+/).length,
        status: 'completed'
      }

      setCurrentPolicy(completedPolicy)
      setGeneratedPolicies(prev => 
        prev.map(p => p.id === newPolicy.id ? completedPolicy : p)
      )

      toast({
        title: "Policy Generated Successfully",
        description: "Your policy has been created and is ready for review."
      })

    } catch (error) {
      const errorPolicy: GeneratedPolicy = {
        ...newPolicy,
        status: 'error'
      }
      
      setCurrentPolicy(errorPolicy)
      setGeneratedPolicies(prev => 
        prev.map(p => p.id === newPolicy.id ? errorPolicy : p)
      )

      toast({
        title: "Generation Failed",
        description: "There was an error generating your policy. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateMockPolicy = (title: string, framework: string, userPrompt: string): string => {
    const frameworkInfo = frameworks.find(f => f.id === framework)?.name || framework
    
    return `# ${title}

## 1. PURPOSE AND SCOPE

This policy establishes guidelines and procedures for ${userPrompt.toLowerCase()} in accordance with ${frameworkInfo} requirements. This policy applies to all employees, contractors, and third parties who have access to organizational resources.

**Framework Alignment:** This section satisfies ${frameworkInfo} control requirements for policy documentation and scope definition.

## 2. POLICY STATEMENT

Our organization is committed to maintaining the highest standards of ${userPrompt.toLowerCase()} through:

- Implementation of appropriate controls and safeguards
- Regular monitoring and assessment of compliance
- Continuous improvement of our security posture
- Training and awareness programs for all personnel

**Framework Alignment:** This section addresses ${frameworkInfo} policy statement requirements.

## 3. ROLES AND RESPONSIBILITIES

### 3.1 Management
- Provide leadership and resources for policy implementation
- Ensure compliance with regulatory requirements
- Review and approve policy updates annually

### 3.2 IT Security Team
- Implement technical controls and monitoring systems
- Conduct regular security assessments
- Respond to security incidents and breaches

### 3.3 All Employees
- Comply with policy requirements and procedures
- Report security incidents promptly
- Participate in required training programs

**Framework Alignment:** This section satisfies ${frameworkInfo} requirements for role-based responsibilities.

## 4. IMPLEMENTATION PROCEDURES

### 4.1 Control Implementation
All controls specified in this policy shall be implemented according to ${frameworkInfo} guidelines:

1. **Risk Assessment**: Regular assessment of risks related to ${userPrompt.toLowerCase()}
2. **Control Selection**: Implementation of appropriate controls based on risk analysis
3. **Monitoring**: Continuous monitoring of control effectiveness
4. **Review**: Regular review and update of controls as needed

### 4.2 Documentation Requirements
- All procedures must be documented and maintained
- Evidence of compliance must be collected and retained
- Regular audits must be conducted to verify effectiveness

**Framework Alignment:** This section addresses ${frameworkInfo} implementation and documentation requirements.

## 5. MONITORING AND COMPLIANCE

### 5.1 Performance Metrics
Key performance indicators for this policy include:
- Compliance assessment scores
- Number of incidents or violations
- Training completion rates
- Control implementation status

### 5.2 Audit and Review
- Annual policy review and update process
- Regular internal audits of policy compliance
- External audit preparation and support
- Corrective action tracking and resolution

**Framework Alignment:** This section satisfies ${frameworkInfo} monitoring and audit requirements.

## 6. ENFORCEMENT

Non-compliance with this policy may result in disciplinary action up to and including termination of employment or contract. All violations will be investigated and appropriate corrective measures will be taken.

## 7. POLICY MAINTENANCE

This policy will be reviewed annually or as required by changes in:
- Regulatory requirements
- Business operations
- Technology infrastructure
- Risk environment

**Effective Date:** ${new Date().toLocaleDateString()}
**Review Date:** ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
**Version:** 1.0

---
*This policy was generated by CompliAI Policy Generator in accordance with ${frameworkInfo} requirements.*`
  }

  const startEditing = () => {
    if (currentPolicy && currentPolicy.content) {
      setEditedContent(currentPolicy.content)
      setIsEditing(true)
    }
  }

  const saveEdits = () => {
    if (currentPolicy && editedContent) {
      const updatedPolicy: GeneratedPolicy = {
        ...currentPolicy,
        content: editedContent,
        wordCount: editedContent.split(/\s+/).length
      }
      
      setCurrentPolicy(updatedPolicy)
      setGeneratedPolicies(prev => 
        prev.map(p => p.id === currentPolicy.id ? updatedPolicy : p)
      )
      setIsEditing(false)
      
      toast({
        title: "Changes Saved",
        description: "Your policy edits have been saved successfully."
      })
    }
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditedContent("")
  }

  const copyToClipboard = () => {
    if (currentPolicy?.content) {
      navigator.clipboard.writeText(currentPolicy.content)
      toast({
        title: "Copied to Clipboard",
        description: "Policy content has been copied to your clipboard."
      })
    }
  }

  const exportToPDF = async () => {
    if (!currentPolicy?.content) return
    
    try {
      toast({
        title: "Exporting to PDF",
        description: "Your policy document is being prepared for download."
      })

      // Import html2pdf dynamically
      const html2pdf = (await import('html2pdf.js')).default
      
      // Create a temporary container with the rendered markdown content
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.width = '210mm' // A4 width
      tempContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif'
      tempContainer.style.fontSize = '14px'
      tempContainer.style.lineHeight = '1.6'
      tempContainer.style.color = '#374151'
      document.body.appendChild(tempContainer)

      // Add title and metadata
      const titleSection = document.createElement('div')
      titleSection.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
          <h1 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 10px;">${currentPolicy.title}</h1>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;"><strong>Framework:</strong> ${frameworks.find(f => f.id === currentPolicy.framework)?.name || currentPolicy.framework}</div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;"><strong>Generated:</strong> ${currentPolicy.generatedAt.toLocaleString()}</div>
          <div style="font-size: 12px; color: #6b7280;"><strong>Word Count:</strong> ${currentPolicy.wordCount} words</div>
        </div>
      `
      tempContainer.appendChild(titleSection)

      // Process markdown to HTML
      const contentContainer = document.createElement('div')
      const processedHTML = currentPolicy.content
        .replace(/^# (.+)$/gm, '<h1 style="font-size: 20px; font-weight: bold; margin: 24px 0 16px 0; color: #1f2937;">$1</h1>')
        .replace(/^## (.+)$/gm, '<h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 12px 0; color: #1f2937; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">$1</h2>')
        .replace(/^### (.+)$/gm, '<h3 style="font-size: 16px; font-weight: 600; margin: 16px 0 8px 0; color: #374151;">$1</h3>')
        .replace(/^\*\*Framework Alignment:\*\*(.+)$/gm, '<div style="background: #dbeafe; color: #1e40af; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; margin: 8px 0; border: 1px solid #3b82f6;"><strong>Framework Alignment:</strong>$1</div>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li style="margin: 4px 0;">$1</li>')
        .replace(/(<li.*<\/li>)/g, '<ul style="margin: 8px 0; padding-left: 20px;">$1</ul>')
        .replace(/^\d+\. (.+)$/gm, '<li style="margin: 4px 0;">$1</li>')
        .replace(/^(?!<[hl]|<ul|<li|<div|<strong|<em)(.+)$/gm, '<p style="margin: 6px 0; line-height: 1.6;">$1</p>')

      contentContainer.innerHTML = processedHTML
      tempContainer.appendChild(contentContainer)

      // PDF options
      const opt = {
        margin: [15, 15, 15, 15] as [number, number, number, number],
        filename: `${currentPolicy.title.replace(/[^a-zA-Z0-9]/g, '_')}_policy.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      // Generate PDF
      await html2pdf().set(opt).from(tempContainer).save()
      
      // Cleanup
      document.body.removeChild(tempContainer)
      
      toast({
        title: "Export Completed",
        description: "PDF downloaded successfully."
      })
      
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    }
  }

  const exportToWord = async () => {
    if (!currentPolicy?.content) return
    
    try {
      toast({
        title: "Exporting to Word",
        description: "Your policy document is being prepared for download."
      })

      // Import docx and file-saver dynamically
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx')
      const { saveAs } = await import('file-saver')
      
      // Parse markdown content to create Word document elements
      const parseMarkdownToDocx = (markdown: string) => {
        const lines = markdown.split('\n')
        const elements: any[] = []
        
        // Add title section
        elements.push(
          new Paragraph({
            children: [new TextRun({ text: currentPolicy.title, bold: true, size: 32 })],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          })
        )
        
        let currentParagraph: string[] = []
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          
          if (!trimmedLine) {
            if (currentParagraph.length > 0) {
              const paragraphText = currentParagraph.join(' ')
              elements.push(
                new Paragraph({
                  children: [new TextRun({ text: paragraphText.replace(/\*\*/g, '') })],
                  spacing: { after: 200 }
                })
              )
              currentParagraph = []
            }
            continue
          }
          
          if (trimmedLine.startsWith('# ')) {
            if (currentParagraph.length > 0) {
              elements.push(
                new Paragraph({
                  children: [new TextRun({ text: currentParagraph.join(' ').replace(/\*\*/g, '') })],
                  spacing: { after: 200 }
                })
              )
              currentParagraph = []
            }
            elements.push(
              new Paragraph({
                children: [new TextRun({ text: trimmedLine.substring(2), bold: true, size: 28 })],
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 }
              })
            )
          } else if (trimmedLine.startsWith('## ')) {
            if (currentParagraph.length > 0) {
              elements.push(
                new Paragraph({
                  children: [new TextRun({ text: currentParagraph.join(' ').replace(/\*\*/g, '') })],
                  spacing: { after: 200 }
                })
              )
              currentParagraph = []
            }
            elements.push(
              new Paragraph({
                children: [new TextRun({ text: trimmedLine.substring(3), bold: true, size: 24 })],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 }
              })
            )
          } else {
            currentParagraph.push(trimmedLine)
          }
        }
        
        if (currentParagraph.length > 0) {
          elements.push(
            new Paragraph({
              children: [new TextRun({ text: currentParagraph.join(' ').replace(/\*\*/g, '') })],
              spacing: { after: 200 }
            })
          )
        }
        
        return elements
      }

      const docElements = parseMarkdownToDocx(currentPolicy.content)
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: docElements
        }]
      })
      
      const buffer = await Packer.toBlob(doc)
      saveAs(buffer, `${currentPolicy.title.replace(/[^a-zA-Z0-9]/g, '_')}_policy.docx`)
      
      toast({
        title: "Export Completed",
        description: "Word document downloaded successfully."
      })
      
    } catch (error) {
      console.error('Word export error:', error)
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setPrompt("")
    setSelectedFramework("")
    setPolicyTitle("")
    setCurrentPolicy(null)
    setIsEditing(false)
    setEditedContent("")
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Policy Generator</h1>
        <p className="text-gray-600">
          Generate comprehensive compliance policies using AI. Simply describe what you need and select your framework.
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate Policy</TabsTrigger>
          <TabsTrigger value="review">Review & Edit</TabsTrigger>
          <TabsTrigger value="export">Export Options</TabsTrigger>
          <TabsTrigger value="history">Policy History</TabsTrigger>
        </TabsList>

        {/* Generate Policy Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wand2 className="h-5 w-5 text-blue-600" />
                <span>Create New Policy</span>
              </CardTitle>
              <CardDescription>
                Describe your policy requirements and let AI generate a comprehensive, framework-compliant document.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Policy Title */}
              <div className="space-y-2">
                <Label htmlFor="policyTitle">Policy Title *</Label>
                <Input
                  id="policyTitle"
                  value={policyTitle}
                  onChange={(e) => setPolicyTitle(e.target.value)}
                  placeholder="e.g., Information Security Policy, Data Privacy Policy"
                  disabled={isGenerating}
                />
              </div>

              {/* Framework Selection */}
              <div className="space-y-2">
                <Label htmlFor="framework">Compliance Framework *</Label>
                <Select value={selectedFramework} onValueChange={setSelectedFramework} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the compliance framework for your policy" />
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

              {/* Policy Requirements */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Policy Requirements *</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you need in your policy. For example:
• Security controls for remote work
• Data protection measures for customer information  
• Access control procedures for cloud systems
• Incident response protocols
• Employee training requirements

Be as specific as possible to get the best results."
                  rows={8}
                  disabled={isGenerating}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Be specific about your requirements for better results</span>
                  <span>{prompt.length}/2000 characters</span>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Form
                  </Button>
                  
                  <Button
                    onClick={generatePolicy}
                    disabled={!prompt.trim() || !selectedFramework || !policyTitle.trim() || isGenerating}
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
                        Generate Policy
                      </>
                    )}
                  </Button>
                </div>

                {isGenerating && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-gray-600">
                      AI is analyzing your requirements and generating a comprehensive policy...
                    </div>
                    <Progress value={66} className="h-2" />
                    <p className="text-xs text-gray-500">
                      This may take a few moments to ensure quality and compliance.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Start Examples</CardTitle>
              <CardDescription>
                Click on any example to use it as a starting point
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Remote Work Security",
                    framework: "ISO27001",
                    prompt: "Create a comprehensive policy for secure remote work including VPN usage, device management, home office security, and data protection measures."
                  },
                  {
                    title: "Data Privacy Compliance",
                    framework: "GDPR",
                    prompt: "Develop a data privacy policy covering personal data collection, processing, storage, subject rights, and breach notification procedures."
                  },
                  {
                    title: "Access Control Policy",
                    framework: "SOC2",
                    prompt: "Create an access control policy defining user authentication, authorization procedures, privileged access management, and regular access reviews."
                  },
                  {
                    title: "Incident Response Plan",
                    framework: "NIST_CSF",
                    prompt: "Develop an incident response policy including detection procedures, containment strategies, recovery processes, and post-incident analysis."
                  }
                ].map((example, index) => (
                  <Card key={index} className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setPolicyTitle(example.title)
                      setSelectedFramework(example.framework)
                      setPrompt(example.prompt)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{example.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {example.prompt}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {frameworks.find(f => f.id === example.framework)?.name}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review & Edit Tab */}
        <TabsContent value="review" className="space-y-6">
          {currentPolicy ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span>{currentPolicy.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {frameworks.find(f => f.id === currentPolicy.framework)?.name}
                    </Badge>
                    <Badge variant="outline">
                      {currentPolicy.wordCount} words
                    </Badge>
                    {currentPolicy.status === 'completed' && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Generated
                      </Badge>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  Review and edit your generated policy. All changes are automatically saved.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentPolicy.status === 'generating' ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Your Policy</h3>
                      <p className="text-gray-600">AI is creating a comprehensive policy based on your requirements...</p>
                    </div>
                  </div>
                ) : currentPolicy.status === 'error' ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="h-5 w-5 text-red-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Generation Failed</h3>
                      <p className="text-gray-600 mb-4">There was an error generating your policy. Please try again.</p>
                      <Button onClick={() => generatePolicy()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Generation
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Generated on {currentPolicy.generatedAt.toLocaleString()}
                      </div>
                      <div className="flex space-x-2">
                        {!isEditing ? (
                          <Button variant="outline" onClick={startEditing}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Policy
                          </Button>
                        ) : (
                          <>
                            <Button variant="outline" onClick={cancelEditing}>
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                            <Button onClick={saveEdits}>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="editContent">Edit Content</Label>
                          <Textarea
                            id="editContent"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="min-h-96 font-mono text-sm"
                            placeholder="Edit your policy content here..."
                          />
                          <div className="text-xs text-gray-500">
                            Words: {editedContent.split(/\s+/).length}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Preview</Label>
                          <div className="border rounded-lg p-4 bg-white min-h-96 overflow-y-auto">
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={MarkdownComponents}
                              >
                                {editedContent || "Start editing to see the preview..."}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-6 bg-gray-50 max-h-96 overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={MarkdownComponents}
                          >
                            {currentPolicy.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Policy Generated</h3>
                  <p className="text-gray-600 mb-4">
                    Generate a policy first to review and edit it here.
                  </p>
                  <Button onClick={() => {
                    const tabs = document.querySelector('[data-state="active"]')?.parentElement
                    const generateTab = tabs?.querySelector('[value="generate"]') as HTMLElement
                    generateTab?.click()
                  }}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Export Options Tab */}
        <TabsContent value="export" className="space-y-6">
          {currentPolicy && currentPolicy.status === 'completed' ? (
            <>
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
                      <span className="text-xs text-gray-500">Raw markdown text</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Policy Information</CardTitle>
                  <CardDescription>
                    Summary of your generated policy for record keeping.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Policy Title:</span>
                      <p className="mt-1">{currentPolicy.title}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Framework:</span>
                      <p className="mt-1">{frameworks.find(f => f.id === currentPolicy.framework)?.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Generated:</span>
                      <p className="mt-1">{currentPolicy.generatedAt.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Word Count:</span>
                      <p className="mt-1">{currentPolicy.wordCount} words</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <span className="font-medium text-gray-600">Original Requirements:</span>
                    <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-lg">{currentPolicy.prompt}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Policy Ready for Export</h3>
                  <p className="text-gray-600 mb-4">
                    Generate and review a policy first to access export options.
                  </p>
                  <Button onClick={() => {
                    const tabs = document.querySelector('[data-state="active"]')?.parentElement
                    const generateTab = tabs?.querySelector('[value="generate"]') as HTMLElement
                    generateTab?.click()
                  }}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Policy History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span>Policy History</span>
              </CardTitle>
              <CardDescription>
                View and manage your previously generated policies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedPolicies.length > 0 ? (
                <div className="space-y-4">
                  {generatedPolicies.map((policy) => (
                    <Card key={policy.id} className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setCurrentPolicy(policy)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{policy.title}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {policy.prompt.substring(0, 120)}...
                            </p>
                            <div className="flex items-center space-x-3 mt-2">
                              <Badge variant="outline">
                                {frameworks.find(f => f.id === policy.framework)?.name}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {policy.generatedAt.toLocaleDateString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                {policy.wordCount} words
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Badge variant={
                              policy.status === 'completed' ? 'default' :
                              policy.status === 'generating' ? 'secondary' : 'destructive'
                            }>
                              {policy.status === 'completed' ? 'Ready' :
                               policy.status === 'generating' ? 'Generating' : 'Error'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Policies Generated Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Your generated policies will appear here for easy access and management.
                  </p>
                  <Button onClick={() => {
                    const tabs = document.querySelector('[data-state="active"]')?.parentElement
                    const generateTab = tabs?.querySelector('[value="generate"]') as HTMLElement
                    generateTab?.click()
                  }}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Your First Policy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
