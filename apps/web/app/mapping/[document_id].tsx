"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Database, AlertCircle } from "lucide-react"

export default function DocumentMappingPage() {
  const router = useRouter()
  const params = useParams()
  const documentId = params?.document_id as string
  const [mapping, setMapping] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!documentId) return
    setLoading(true)
    apiClient
      .getDocumentMapping(documentId)
      .then((res) => {
        if (res.success && res.data) {
          setMapping(res.data.framework_mapping)
        } else {
          setError(res.error || "Failed to load mapping data")
        }
      })
      .catch((err) => setError(err.message || "Network error"))
      .finally(() => setLoading(false))
  }, [documentId])

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center">
        <Database className="h-10 w-10 text-blue-400 animate-spin mb-4" />
        <div className="text-lg text-gray-700">Loading mapping results...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center">
        <AlertCircle className="h-10 w-10 text-red-400 mb-4" />
        <div className="text-lg text-red-700">{error}</div>
        <button className="mt-4 text-blue-600 underline" onClick={() => router.back()}>
          Go Back
        </button>
      </div>
    )
  }

  if (!mapping) {
    return (
      <div className="p-8 flex flex-col items-center">
        <AlertCircle className="h-10 w-10 text-yellow-400 mb-4" />
        <div className="text-lg text-yellow-700">No mapping data found for this document.</div>
        <button className="mt-4 text-blue-600 underline" onClick={() => router.back()}>
          Go Back
        </button>
      </div>
    )
  }

  // Prepare summary for chart
  const frameworks = Object.keys(mapping)
  const summary = frameworks.map((fw) => {
    const covered = mapping[fw].covered.length
    const missing = mapping[fw].missing.length
    const total = covered + missing
    return { fw, covered, missing, total }
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-gray-900">Compliance Mapping Results</h1>
      <p className="text-gray-600 mb-6">Document ID: <span className="font-mono text-blue-700">{documentId}</span></p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {summary.map(({ fw, covered, missing, total }) => (
          <Card key={fw}>
            <CardHeader>
              <CardTitle className="text-lg">{fw.replace(/_/g, " ")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex justify-between text-sm">
                <span>Coverage</span>
                <span className="font-medium">{total === 0 ? "N/A" : Math.round((covered / total) * 100)}%</span>
              </div>
              <Progress value={total === 0 ? 0 : (covered / total) * 100} className="h-2 mb-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{covered} covered</span>
                <span>{missing} missing</span>
                <span>{total} total</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Framework</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Covered Controls</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Missing Controls</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {frameworks.map((fw) => (
              <tr key={fw}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{fw.replace(/_/g, " ")}</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-700">
                  {mapping[fw].covered.length > 0 ? (
                    <ul className="list-disc ml-4">
                      {mapping[fw].covered.map((ctrl: string) => (
                        <li key={ctrl}>{ctrl}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-red-700">
                  {mapping[fw].missing.length > 0 ? (
                    <ul className="list-disc ml-4">
                      {mapping[fw].missing.map((ctrl: string) => (
                        <li key={ctrl}>{ctrl}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 