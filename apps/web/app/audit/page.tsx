"use client"

import { useState } from "react"
import { dummyAuditTasks, type AuditTask } from "@/lib/dummy"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle, Clock, AlertTriangle, User, Download, Plus, Filter } from "lucide-react"

export default function AuditPage() {
  const [tasks] = useState<AuditTask[]>(dummyAuditTasks)
  const [selectedFramework, setSelectedFramework] = useState("all")

  const getPriorityColor = (priority: AuditTask["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
    }
  }

  const getStatusIcon = (status: AuditTask["status"]) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "Not Started":
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: AuditTask["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Not Started":
        return "bg-gray-100 text-gray-800"
    }
  }

  const completedTasks = tasks.filter((t) => t.status === "Completed").length
  const totalTasks = tasks.length
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100)

  const filteredTasks = selectedFramework === "all" ? tasks : tasks.filter((t) => t.framework === selectedFramework)

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Audit Planner</h1>
        <p className="text-gray-600">Plan and track your compliance audit readiness</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-blue-600">{progressPercentage}%</div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="text-sm text-gray-600">
                    {completedTasks} of {totalTasks} tasks completed
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">High Priority Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {tasks.filter((t) => t.priority === "High" && t.status !== "Completed").length}
                </div>
                <p className="text-sm text-gray-600 mt-2">Requiring immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {
                    tasks.filter((t) => {
                      const daysUntilDue = Math.ceil(
                        (t.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                      )
                      return daysUntilDue <= 7 && t.status !== "Completed"
                    }).length
                  }
                </div>
                <p className="text-sm text-gray-600 mt-2">Due within 7 days</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Framework Readiness</CardTitle>
              <CardDescription>Track your progress across different compliance frameworks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">ISO 27001</span>
                    <span className="text-sm text-gray-600">73%</span>
                  </div>
                  <Progress value={73} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">SOC 2 Type II</span>
                    <span className="text-sm text-gray-600">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">GDPR</span>
                    <span className="text-sm text-gray-600">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
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
                </select>
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      </div>

                      <p className="text-gray-600 mb-3">{task.description}</p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {task.dueDate.toLocaleDateString()}</span>
                        </div>
                        {task.assignee && (
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{task.assignee}</span>
                          </div>
                        )}
                        <Badge variant="outline">{task.framework}</Badge>
                        <Badge variant="outline">{task.category}</Badge>
                      </div>
                    </div>

                    <div className="ml-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Timeline</CardTitle>
              <CardDescription>Visual timeline of your audit preparation milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute left-4 top-6 bottom-0 w-0.5 bg-gray-200"></div>

                  {tasks
                    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                    .map((task, index) => (
                      <div key={task.id} className="relative flex items-start space-x-4 pb-6">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            task.status === "Completed"
                              ? "bg-green-500"
                              : task.status === "In Progress"
                                ? "bg-blue-500"
                                : "bg-gray-300"
                          }`}
                        >
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                            <span className="text-xs text-gray-500">{task.dueDate.toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {task.framework}
                            </Badge>
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Readiness Report</CardTitle>
                <CardDescription>Comprehensive readiness assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall Readiness</span>
                    <span className="font-medium">73%</span>
                  </div>
                  <Progress value={73} />
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evidence Collection</CardTitle>
                <CardDescription>Track audit evidence and documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Evidence Collected</span>
                    <span className="font-medium">45/67</span>
                  </div>
                  <Progress value={67} />
                  <Button variant="outline" className="w-full bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Export Evidence Pack
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>Generate and download compliance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                  <Download className="h-6 w-6 mb-2" />
                  <span className="text-sm">Policy Set Export</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                  <Download className="h-6 w-6 mb-2" />
                  <span className="text-sm">Control Mapping</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                  <Download className="h-6 w-6 mb-2" />
                  <span className="text-sm">Audit Checklist</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
