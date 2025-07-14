"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Calendar, 
  Database, 
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  Download,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  type UploadedDocument, 
  type DocumentUploadResponse 
} from "@/types"
import { getErrorMessage } from "@/lib/utils"

export default function UploadPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [documentName, setDocumentName] = useState("")

  // Load documents on component mount
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.getDocuments()
      
      if (response.success && response.data) {
        const formattedDocuments: UploadedDocument[] = response.data.map((doc: any) => ({
          id: doc.document_id || doc.id,
          name: doc.name || doc.document_name,
          file_type: doc.file_type || doc.type || 'unknown',
          file_size: doc.file_size || doc.size || 'Unknown',
          uploaded_at: new Date(doc.uploaded_at || doc.created_at),
          user_id: doc.user_id,
          status: doc.status || 'processed',
          chunks_created: doc.chunks_created || doc.chunks_count,
          controls_identified: doc.controls_identified,
          error_message: doc.error_message
        }))
        setDocuments(formattedDocuments)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      setError('Failed to load documents. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['.pdf', '.docx', '.txt']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!allowedTypes.includes(fileExtension)) {
      setError(`File type ${fileExtension} not supported. Allowed types: ${allowedTypes.join(', ')}`)
      return
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB')
      return
    }

    try {
      setIsUploading(true)
      setError(null)
      setSuccess(null)
      setUploadProgress("Uploading file...")

      const response = await apiClient.uploadDocument(file, documentName || undefined)
      
      if (response.success && response.data) {
        const uploadResponse = response.data as DocumentUploadResponse
        
        setSuccess(`Document uploaded successfully! ${uploadResponse.chunks_created} chunks created, ${uploadResponse.controls_identified} controls identified.`)
        setDocumentName("")
        
        // Reload documents list
        await loadDocuments()
        
        // Auto-clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000)
      } else {
        setError(response.error || 'Failed to upload document')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError(getErrorMessage(error))
    } finally {
      setIsUploading(false)
      setUploadProgress("")
    }
  }

  const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      setError(null)
      const response = await apiClient.deleteDocument(documentId)
      
      if (response.success) {
        setSuccess('Document deleted successfully')
        await loadDocuments()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response.error || 'Failed to delete document')
      }
    } catch (error) {
      console.error('Delete error:', error)
      setError(getErrorMessage(error))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Processed</Badge>
      case 'processing':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Processing</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatFileSize = (sizeStr: string): string => {
    // If it's already formatted, return as is
    if (sizeStr.includes('MB') || sizeStr.includes('KB') || sizeStr.includes('GB')) {
      return sizeStr
    }
    // If it's a number, format it
    const size = parseInt(sizeStr)
    if (isNaN(size)) return sizeStr
    
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Upload</h1>
        <p className="text-gray-600">
          Upload compliance documents for AI-powered analysis and querying. 
          Supported formats: PDF, DOCX, TXT (max 10MB)
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 text-red-600 hover:text-red-800"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 text-green-600 hover:text-green-800"
              onClick={() => setSuccess(null)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Document</span>
          </CardTitle>
          <CardDescription>
            Upload your compliance documents for processing and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Document Name Input */}
          <div className="mb-4">
            <Label htmlFor="document-name">Document Name (Optional)</Label>
            <Input
              id="document-name"
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter a custom name for your document"
              className="mt-1"
              disabled={isUploading}
            />
          </div>

          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragOver 
                ? "border-blue-400 bg-blue-50" 
                : "border-gray-300 hover:border-gray-400"
            } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <p className="text-sm font-medium text-gray-900">{uploadProgress}</p>
                <p className="text-xs text-gray-500 mt-1">Please wait while we process your document...</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Drop files here or click to upload
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      Supports PDF, DOCX, TXT files up to 10MB
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleInputFileChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Uploaded Documents</CardTitle>
            <CardDescription>
              Your uploaded compliance documents and their processing status
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDocuments}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
              <p className="text-gray-600">Upload your first compliance document to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Upload Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Analysis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                            <div className="text-sm text-gray-500">{doc.file_type.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(doc.file_size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {doc.uploaded_at.toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {doc.chunks_created && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Database className="h-3 w-3 mr-1" />
                              {doc.chunks_created} chunks
                            </div>
                          )}
                          {doc.controls_identified && (
                            <div className="flex items-center text-xs text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {doc.controls_identified} controls
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
