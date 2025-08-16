"use client"
import React, { useState } from "react";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { 
  AlertCircle, 
  Database, 
  FileText, 
  CheckCircle, 
  XCircle, 
  ChevronLeft,
  BarChart2,
  ListChecks,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type Mapping = {
  framework: string;
  control_id: string;
  control_title: string;
  mapping_confidence: string;
  rationale: string;
};

type MappedControl = {
  extracted_statement: string;
  ai_control_summary: string;
  mappings: Mapping[];
};

type Gap = {
  control_id: string;
  control_title: string;
  description: string;
};

type AnalysisData = {
  framework_mapping: {
    analysis_summary: {
      document_character_count: number;
      identified_controls_count: number;
      frameworks_analyzed: string[];
    };
    mapped_controls: MappedControl[];
    gap_analysis: {
      [framework: string]: Gap[];
    };
  }
};

// const ConfidenceBadge = ({ level }: { level: string }) => {
//   const variant = level === "High" ? "success" : level === "Medium" ? "warning" : "destructive";
//   return <Badge variant={variant}>{level} Confidence</Badge>;
// };

const FrameworkTag = ({ name }: { name: string }) => (
  <Badge variant="secondary" className="mr-2 mb-1">
    {name}
  </Badge>
);

export default function GRCAnalysis() {
  const router = useRouter();
  const params = useParams();
  const documentId = params?.document_id as string;
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!documentId) return;
    
    setLoading(true);
    apiClient
      .getDocumentMapping(documentId)
      .then((res) => {
        if (res.success && res.data) {
          setAnalysisData(res.data);
        } else {
          setError(res.error || "Failed to load analysis data");
        }
      })
      .catch((err) => setError(err.message || "Network error"))
      .finally(() => setLoading(false));
  }, [documentId]);

  const filteredMappedControls = analysisData?.framework_mapping.mapped_controls.filter(control => 
    control.ai_control_summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    control.extracted_statement.toLowerCase().includes(searchTerm.toLowerCase()) ||
    control.mappings.some(m => 
      m.control_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.control_title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const filteredGaps = analysisData?.framework_mapping.gap_analysis 
    ? Object.entries(analysisData.framework_mapping.gap_analysis).reduce((acc, [framework, gaps]) => {
        const filtered = gaps.filter(gap => 
          gap.control_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gap.control_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gap.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filtered.length > 0) {
          acc[framework] = filtered;
        }
        return acc;
      }, {} as Record<string, Gap[]>)
    : {};

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Skeleton className="h-8 w-8 rounded-md mr-3" />
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center mb-4">
                <Skeleton className="h-6 w-6 mr-3" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          ))}
        </div>
        
        <Tabs defaultValue="mapped">
          <TabsList className="mb-4">
            <TabsTrigger value="mapped">
              <Skeleton className="h-4 w-24" />
            </TabsTrigger>
            <TabsTrigger value="gap">
              <Skeleton className="h-4 w-20" />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="mapped">
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  <div className="space-y-3">
                    {[1, 2].map((_, j) => (
                      <div key={j} className="pl-4 border-l-2 border-border">
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-3 w-1/4 mb-1" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-red-500/10 p-4 rounded-full mb-4">
          <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Analysis Failed</h2>
        <p className="text-muted-foreground mb-6 text-center">{error}</p>
        <div className="flex gap-3">
          <button 
            className="px-4 py-2 bg-card hover:bg-accent rounded-md flex items-center text-foreground"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Go Back
          </button>
          <button 
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-yellow-500/10 p-4 rounded-full mb-4">
          <AlertCircle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">No Analysis Data</h2>
        <p className="text-muted-foreground mb-6 text-center">We couldn't find any analysis data for this document.</p>
        <button 
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md flex items-center"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Go Back
        </button>
      </div>
    );
  }

  const {
    analysis_summary,
    mapped_controls,
    gap_analysis
  } = analysisData.framework_mapping;

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1800px] mx-auto">
      <div className="flex items-center mb-4 sm:mb-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-primary hover:text-primary/80 mr-2 sm:mr-4"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="hidden sm:inline ml-1">Back</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center">
          <BarChart2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary" />
          Compliance Analysis
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card className="bg-blue-500/10 border-blue-200 dark:border-blue-800">
          <CardContent className="p-3 sm:p-4 flex items-center">
            <div className="bg-blue-500/20 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Document Size</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">{analysis_summary.document_character_count.toLocaleString()} characters</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-3 sm:p-4 flex items-center">
            <div className="bg-emerald-500/20 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Controls Identified</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">{analysis_summary.identified_controls_count}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-200 dark:border-purple-800">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Frameworks Analyzed</p>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {analysis_summary.frameworks_analyzed.map(f =>
                <Badge key={f} variant="secondary" className="text-xs py-1 px-2">
                  {f}
                </Badge> 
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mapped" className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-3">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="mapped" className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2">
              <ListChecks className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Mapped Controls
              <Badge variant="outline" className="ml-1 sm:ml-2 text-xs">{mapped_controls.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="gap" className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2r">
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Gap Analysis
              <Badge variant="destructive" className="ml-1 sm:ml-2 text-xs">
                {Object.values(gap_analysis).reduce((sum, gaps) => sum + gaps.length, 0)}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              placeholder="Search controls..."
              className="pl-8 sm:pl-10 h-9 sm:h-10 text-xs sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="mapped">
          <ScrollArea className="h-[calc(100vh-220px)] sm:h-[calc(100vh-280px)] pr-2 sm:pr-4">
            {filteredMappedControls.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {filteredMappedControls.map((control, idx) => (
                  <Card key={idx} className="border border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 line-clamp-2">{control.ai_control_summary}</h3>
                        <div className="text-xs sm:text-sm text-muted-foreground italic bg-muted p-2 sm:p-3 rounded-md line-clamp-3">
                          "{control.extracted_statement}"
                        </div>
                      </div>
                      
                      <div className="border-t pt-3 sm:pt-4">
                        <h4 className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3 flex items-center">
                          <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 sm:py-1 rounded mr-2">Mappings</span>
                          {control.mappings.length} framework matches
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {control.mappings.map((map, i) => (
                            <div 
                              key={i} 
                              className="border-l-4 border-blue-400 pl-2 sm:pl-4 py-2 sm:py-3 bg-blue-500/10 rounded-r-md"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-xs sm:text-sm font-medium">
                                    <span className="font-semibold text-foreground">{map.framework}</span> - {map.control_id}
                                  </p>
                                  <p className="text-xs text-muted-foreground mb-1 sm:mb-2 line-clamp-2">{map.control_title}</p>
                                </div>
                                {/* <ConfidenceBadge level={map.mapping_confidence} /> */}
                              </div>
                              <p className="text-xs text-muted-foreground bg-card p-1 sm:p-2 rounded mt-1 line-clamp-2">{map.rationale}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Search className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-foreground">No matching controls found</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Try adjusting your search term</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="gap">
          <ScrollArea className="h-[calc(100vh-220px)] sm:h-[calc(100vh-280px)] pr-2 sm:pr-4">
            {Object.keys(filteredGaps).length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(filteredGaps).map(([framework, gaps], i) => (
                  <Card key={i} className="border border-border shadow-sm">
                    <CardContent className="p-0">
                      <div className="bg-muted px-3 sm:px-4 py-2 sm:py-3 border-b">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground flex items-center">
                          <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-2" />
                          {framework} 
                          <Badge variant="destructive" className="ml-2 text-xs">{gaps.length} gaps</Badge>
                        </h3>
                      </div>
                      
                      <div className="divide-y">
                        {gaps.map((gap, j) => (
                          <div key={j} className="p-3 sm:p-4 hover:bg-muted">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-xs sm:text-sm">
                                  <span className="text-red-600 dark:text-red-400">{gap.control_id}</span>: {gap.control_title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{gap.description}</p>
                              </div>
                              <Badge variant="destructive" className="text-xs">Gap</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-emerald-500 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-foreground">No gaps found</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Great job! All controls are covered</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}