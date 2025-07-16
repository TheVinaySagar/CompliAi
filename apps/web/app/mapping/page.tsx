"use client"

import { useState } from "react"
import { type ControlMapping, type ComplianceFramework } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertTriangle, XCircle, Eye, Download, Filter } from "lucide-react"

export default function MappingPage() {
  const [selectedFramework, setSelectedFramework] = useState("all")
  const [mappings] = useState<ControlMapping[]>([])
  const [frameworks] = useState<ComplianceFramework[]>([])

  const getStatusIcon = (status: ControlMapping["status"]) => {
    switch (status) {
      case "Mapped":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Needs Review":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "Gap":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: ControlMapping["status"]) => {
    switch (status) {
      case "Mapped":
        return "bg-green-100 text-green-800"
      case "Needs Review":
        return "bg-yellow-100 text-yellow-800"
      case "Gap":
        return "bg-red-100 text-red-800"
    }
  }

  const getConfidenceColor = (confidence: ControlMapping["confidence"]) => {
    switch (confidence) {
      case "High":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-red-100 text-red-800"
    }
  }

  const filteredMappings =
    selectedFramework === "all" ? mappings : mappings.filter((m) => m.framework === selectedFramework)

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Control Mapping</h1>
        <p className="text-gray-600">View and manage compliance control mappings across frameworks</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Framework Overview</TabsTrigger>
          <TabsTrigger value="mappings">Control Mappings</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {frameworks.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No frameworks configured</h3>
              <p className="mt-1 text-sm text-gray-500">Upload documents and start mapping controls to compliance frameworks.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {frameworks.map((framework) => (
                <Card key={framework.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{framework.name}</CardTitle>
                    <CardDescription className="text-sm">{framework.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Coverage</span>
                        <span className="font-medium">{framework.coverage}%</span>
                      </div>
                      <Progress value={framework.coverage} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{framework.mappedControls} mapped</span>
                        <span>{framework.totalControls} total</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mappings" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">All Frameworks</option>
                  <option value="ISO 27001">ISO 27001</option>
                  <option value="SOC 2">SOC 2</option>
                  <option value="GDPR">GDPR</option>
                  <option value="NIST CSF">NIST CSF</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mapped To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Framework
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMappings.map((mapping) => (
                  <tr key={mapping.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{mapping.section}</div>
                        <div className="text-sm text-gray-500">{mapping.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mapping.mappedTo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline">{mapping.framework}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(mapping.confidence)}`}
                      >
                        {mapping.confidence}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(mapping.status)}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mapping.status)}`}
                        >
                          {mapping.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Critical Gaps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-2">3</div>
                <p className="text-sm text-gray-600">Controls requiring immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-yellow-600">Needs Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600 mb-2">7</div>
                <p className="text-sm text-gray-600">Controls needing documentation updates</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Well Mapped</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">45</div>
                <p className="text-sm text-gray-600">Controls properly documented and mapped</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Remediation Suggestions</CardTitle>
              <CardDescription>AI-powered recommendations to close compliance gaps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-medium text-gray-900">Vendor Management Policy Missing</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    ISO 27001 A.15.1.1 requires a formal policy for supplier relationships. Consider creating a vendor
                    security assessment process.
                  </p>
                  <Button size="sm" className="mt-2">
                    Generate Policy Template
                  </Button>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium text-gray-900">Backup Procedures Need Enhancement</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Current backup documentation doesn't fully address ISO 27001 A.12.3.1 requirements. Add recovery
                    time objectives and testing procedures.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                    View Recommendations
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
