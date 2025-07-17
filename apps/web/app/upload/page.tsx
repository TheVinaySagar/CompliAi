"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { type UploadedFile } from "@/types"
import { Upload, FileText, CheckCircle, Calendar, Database, AlertCircle, Loader } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load existing documents on component mount
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getDocuments()
      
      if (response.success && response.data) {
        // Convert API response to UploadedFile format
        const convertedFiles: UploadedFile[] = response.data.map((doc: any) => ({
          id: doc.document_id || doc.id,
          name: doc.name || "Unknown Document",
          size: doc.file_size && doc.file_size > 0 
            ? `${Math.round((doc.file_size) / 1024 / 1024 * 10) / 10} MB`
            : doc.size || "Unknown size",
          uploadDate: new Date(doc.uploaded_at || Date.now()),
          extractedPolicies: doc.policies_extracted || 0,
          mappedControls: doc.controls_identified || 0,
          status: doc.status === "processed" ? "Completed" : 
                  doc.status === "processing" ? "Processing" : "Failed"
        }))
        
        setUploadedFiles(convertedFiles)
      } else {
        console.error("Failed to load documents:", response.error)
        setUploadedFiles([])
      }
    } catch (error) {
      console.error("Error loading documents:", error)
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
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
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

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload Policy Documents</h1>
        <p className="text-gray-600">Upload your policy documents to extract and map compliance controls</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Document uploaded successfully! Policies extracted and controls mapped.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Upload Failed: {errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="mb-8">
        <div
          className={`relative border-2 border-dashed rounded-lg p-12 text-center hover:border-gray-400 transition-colors ${
            isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
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
              <Loader className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
              <div className="mt-4">
                <span className="block text-sm font-medium text-gray-900">Uploading and processing...</span>
                <span className="block text-sm text-gray-500">This may take a few moments</span>
              </div>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">Drop files here or click to upload</span>
                  <span className="mt-1 block text-sm text-gray-500">Supports .pdf, .docx files up to 10MB</span>
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
      </div>

      {/* Uploaded Files Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Uploaded Documents</h2>
          {isLoading && (
            <p className="text-sm text-gray-500 mt-1">Loading documents...</p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mapped Controls
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <Loader className="h-5 w-5 text-gray-400 animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Loading documents...</span>
                    </div>
                  </td>
                </tr>
              ) : uploadedFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-500">No documents uploaded yet</span>
                  </td>
                </tr>
              ) : (
                uploadedFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{file.name}</div>
                          <div className="text-xs text-gray-500">ID: {file.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {file.uploadDate.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        file.status === "Completed" ? "bg-green-100 text-green-800" :
                        file.status === "Processing" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {file.status === "Processing" && <Loader className="h-3 w-3 mr-1 animate-spin" />}
                        {file.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Database className="h-3 w-3 mr-1" />
                        {file.mappedControls} controls
                      </span>
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
