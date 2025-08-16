"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { type UploadedFile } from "@/types"
import { Upload, FileText, CheckCircle, Calendar, Database, AlertCircle, Loader } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const router = useRouter()

  // Load existing documents on component mount
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
  try {
    setIsLoading(true)

    const response = await apiClient.getDocuments()

    if (!response || typeof response !== "object") {
      throw new Error("Unexpected response format from API")
    }

    const { success, data, error } = response

    if (success && Array.isArray(data)) {
      const convertedFiles: UploadedFile[] = data.map((doc: any) => ({
        id: doc.document_id || doc.id || crypto.randomUUID(),
        name: doc.name || "Untitled Document",
        uploadDate: doc.uploaded_at ? new Date(doc.uploaded_at) : new Date(),
        extractedPolicies: doc.policies_extracted ?? 0,
        mappedControls: doc.controls_identified ?? 0,
        status:
          doc.status === "processed"
            ? "Completed"
            : doc.status === "processing"
            ? "Processing"
            : "Failed",
      }))

      setUploadedFiles(convertedFiles)
    } else {
      console.error("API returned unsuccessful response:", error || response)
      setUploadedFiles([])
    }
  } catch (error: any) {
    console.error("Exception occurred while loading documents:", error?.message || error)
    setUploadedFiles([])
  } finally {
    setIsLoading(false)
  }
}


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      uploadDocument(files[0])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      uploadDocument(files[0])
    }
  }

  const uploadDocument = async (file: File) => {
    try {
      setIsUploading(true)
      setShowError(false)
      setErrorMessage("")
      
      // Use the original filename
      const response = await apiClient.uploadDocument(file, file.name)
      
      if (response.success && response.data) {
        // Create new file entry with data from API response
        const newFile: UploadedFile = {
          id: response.data.document_id || Date.now().toString(),
          name: file.name,
          uploadDate: new Date(),
          extractedPolicies: response.data.policies_extracted || 0,
          mappedControls: response.data.controls_identified || 0,
          status: response.data.status === "success" ? "Completed" : "Processing"
        }

        setUploadedFiles([newFile, ...uploadedFiles])
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        setErrorMessage(response.error || "Failed to upload document")
        setShowError(true)
        setTimeout(() => setShowError(false), 5000)
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Network error")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setIsUploading(false)
    }
  }
  useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 640);
  checkMobile(); // Initialize on mount
  window.addEventListener("resize", checkMobile);
  return () => window.removeEventListener("resize", checkMobile); // Cleanup
}, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">Upload Policy Documents</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Upload your policy documents to extract and map compliance controls</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-4 sm:mb-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 sm:p-4">
          <div className="flex items-start">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Document uploaded successfully! Policies extracted and controls mapped.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="mb-4 sm:mb-6 rounded-md bg-destructive/10 border border-destructive/20 p-3 sm:p-4">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive mt-0.5" />
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-destructive">
                Upload Failed: {errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="mb-6 sm:mb-8">
        {!isMobile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 sm:p-12 text-center hover:border-primary/60 transition-colors ${
            isDragOver ? "border-primary bg-primary/5" : "border-border"
          } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
          onDragOver={(e) => {
            e.preventDefault()
            if (!isUploading) setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader className="h-8 w-8 sm:h-12 sm:w-12 text-primary animate-spin" />
              <div className="mt-2 sm:mt-4">
                <span className="block text-sm sm:text-sm font-medium text-foreground">Uploading and processing...</span>
                <span className="block text-sm sm:text-sm text-muted-foreground">This may take a few moments</span>
              </div>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
              <div className="mt-2 sm:mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="block text-xs sm:text-sm font-medium text-foreground">Drop files here or click to upload</span>
                  <span className="block text-xs sm:text-sm text-muted-foreground">Supports .pdf, .docx files up to 10MB</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </>
          )}
        </div>
        ) : (
          // Mobile only click to upload
          <div className="border rounded-lg p-6 text-center border-border">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <div className="mt-2">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="block text-sm font-medium text-foreground">Click to upload</span>
                <span className="block text-sm text-muted-foreground">Supports .pdf, .docx files up to 10MB</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Files Table */}
      <div className="bg-card shadow rounded-lg overflow-hidden border border-border">
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-border">
          <h2 className="text-base sm:text-lg font-medium text-card-foreground">Uploaded Documents</h2>
          {isLoading && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Loading documents...</p>
          )}
        </div>
        <div className="overflow-x-auto">
          {/* Mobile Cards View */}
          <div className="sm:hidden">
            {isLoading ? (
              <div className="p-4 text-center">
                <Loader className="h-5 w-5 text-muted-foreground animate-spin mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">Loading documents...</p>
              </div>
            ) : uploadedFiles.length === 0 ? (
              <div className="p-4 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-card-foreground break-words mb-2">
                          {file.name}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                            <span> {file.uploadDate.toLocaleDateString()} </span>
                         </div>

                         <div className="flex items-center text-xs">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md mr-2 ${
                            file.status === "Completed" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                            file.status === "Processing" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                            "bg-destructive/10 text-destructive"
                          }`}>
                            {file.status === "Processing" && <Loader className="h-3 w-3 mr-1.5 animate-spin" />}
                            {file.status}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary">
                            <Database className="h-3 w-3 mr-1.5" />
                            {file.mappedControls} controls
                          </span>
                        </div>
                      </div>
                        <button
                          className="mt-3 w-full inline-flex justify-center items-center px-3 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium border border-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => router.push(`/mapping/${file.id}`)}
                          disabled={file.status !== "Completed"}
                        >
                          <Database className="h-3 w-3 mr-1.5" />
                          View Mapping
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Desktop Table View */}
          <table className="hidden sm:table min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Mapped Controls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <Loader className="h-5 w-5 text-muted-foreground animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Loading documents...</span>
                    </div>
                  </td>
                </tr>
              ) : uploadedFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <span className="text-sm text-muted-foreground">No documents uploaded yet</span>
                  </td>
                </tr>
              ) : (
                uploadedFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-muted-foreground mr-3" />
                        <div>
                          <div className="text-sm font-medium text-card-foreground max-w-xs">{file.name}</div>
                          <div className="text-xs text-muted-foreground">ID: {file.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {file.uploadDate.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        file.status === "Completed" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                        file.status === "Processing" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                        "bg-destructive/10 text-destructive"
                      }`}>
                        {file.status === "Processing" && <Loader className="h-3 w-3 mr-1 animate-spin" />}
                        {file.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        <Database className="h-3 w-3 mr-1" />
                        {file.mappedControls} controls
                      </span>
                    </td>
                    {/* New: View Mapping Button */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="inline-flex items-center px-3 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium border border-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => router.push(`/mapping/${file.id}`)}
                        disabled={file.status !== "Completed"}
                        title={file.status === "Completed" ? "View Mapping" : "Mapping available after processing"}
                      >
                        <Database className="h-4 w-4 mr-1" />
                        View Mapping
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
