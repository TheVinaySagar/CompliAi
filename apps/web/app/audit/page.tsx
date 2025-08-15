"use client"

import { useState } from "react"
import { type AuditTask } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle, Clock, AlertTriangle, User, Download, Plus, Filter } from "lucide-react"

export default function AuditPage() {
  const [tasks] = useState<AuditTask[]>([])
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
    <div className="p-4 sm:p-6 w-full mx-auto transition-all duration-200">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Audit Planner</h1>
        <p className="text-sm sm:text-base text-gray-600">Plan and track your compliance audit readiness</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2">Overview</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2">Tasks</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2">Timeline</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-base">Overall Progress</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="space-y-2 sm:space-y-3">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{progressPercentage}%</div>
                  <Progress value={progressPercentage} className="h-1 sm:h-2" />
                  <div className="text-xs sm:text-sm text-gray-600">
                    {completedTasks} of {totalTasks} tasks completed
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-base">High Priority Tasks</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">
                  {tasks.filter((t) => t.priority === "High" && t.status !== "Completed").length}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Requiring immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-base">Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600">
                  {
                    tasks.filter((t) => {
                      const daysUntilDue = Math.ceil(
                        (t.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                      )
                      return daysUntilDue <= 7 && t.status !== "Completed"
                    }).length
                  }
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Due within 7 days</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-sm sm:text-base">Framework Readiness</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Track your progress across different compliance frameworks</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="space-y-2 sm:space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs sm:text-sm font-medium">ISO 27001</span>
                    <span className="text-xs sm:text-sm text-gray-600">73%</span>
                  </div>
                  <Progress value={73} className="h-1 sm:h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs sm:text-sm font-medium">SOC 2 Type II</span>
                    <span className="text-xs sm:text-sm text-gray-600">45%</span>
                  </div>
                  <Progress value={45} className="h-1 sm:h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs sm:text-sm font-medium">GDPR</span>
                    <span className="text-xs sm:text-sm text-gray-600">68%</span>
                  </div>
                  <Progress value={68} className="h-1 sm:h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full sm:w-48"
                >
                  <option value="all">All Frameworks</option>
                  <option value="ISO 27001">ISO 27001</option>
                  <option value="SOC 2">SOC 2</option>
                  <option value="GDPR">GDPR</option>
                </select>
              </div>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Add Task</span>
            </Button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-1">{task.title}</h3>
                        <Badge className={`{text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3">{task.description}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Due: {task.dueDate.toLocaleDateString()}</span>
                        </div>
                        {task.assignee && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{task.assignee}</span>
                          </div>
                        )}
                        <Badge variant="outline" className="text-xs">{task.framework}</Badge>
                        <Badge variant="outline" className="text-xs">{task.category}</Badge>
                      </div>
                    </div>

                    <div className="flex sm:flex-col justify-between sm:justify-start items-end sm:items-center gap-2">
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

        <TabsContent value="timeline" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Audit Timeline</CardTitle>
              <CardDescription className="text-sm sm:text-base">Visual timeline of your audit preparation milestones</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
                <div className="relative">
                  <div className="absolute left-4 sm:left-5 top-6 bottom-0 w-0.5 bg-gray-200"></div>

                  {tasks
                    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                    .map((task, index) => (
                      <div key={task.id} className="relative flex items-start gap-3 sm:gap-4 pb-4 sm:pb-6">
                        <div
                          className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
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
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
                            <h4 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-1">{task.title}</h4>
                            <span className="text-xs sm:text-sm text-gray-500">{task.dueDate.toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
                            <Badge variant="outline" className="text-xs">
                              {task.framework}
                            </Badge>
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Audit Readiness Report</CardTitle>
                <CardDescription className="text-sm sm:text-base">Comprehensive readiness assessment</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base">Overall Readiness</span>
                    <span className="font-medium">73%</span>
                  </div>
                  <Progress value={73} className="h-2" />
                  <Button className="w-full" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Evidence Collection</CardTitle>
                <CardDescription className="text-sm sm:text-base">Track audit evidence and documentation</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base">Evidence Collected</span>
                    <span className="font-medium">45/67</span>
                  </div>
                  <Progress value={67} className="h-2" />
                  <Button variant="outline" className="w-full" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Evidence Pack
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Available Reports</CardTitle>
              <CardDescription className="text-sm sm:text-base">Generate and download compliance reports</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Button variant="outline" className="h-16 sm:h-20 flex flex-col items-center justify-center">
                  <Download className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm">Policy Set Export</span>
                </Button>
                <Button variant="outline" className="h-16 sm:h-20 flex flex-col items-center justify-center">
                  <Download className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm">Control Mapping</span>
                </Button>
                <Button variant="outline" className="h-16 sm:h-20 flex flex-col items-center justify-center">
                  <Download className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm">Audit Checklist</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
