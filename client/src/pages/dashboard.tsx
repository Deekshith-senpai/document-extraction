import React, { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import { StatsOverview } from "@/components/stats-overview";
import { UploadZone } from "@/components/upload-zone";
import { LLMRoutingCard } from "@/components/llm-routing-card";
import { DocumentProcessingCard } from "@/components/document-processing-card";
import { RecentlyCompletedTable } from "@/components/recently-completed-table";
import { ConfigModal } from "@/components/config-modal";
import { ErrorModal } from "@/components/error-modal";
import { DocumentDetailsModal } from "@/components/document-details-modal";
import { useDocuments, useStats } from "@/hooks/use-documents";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { llmConfigApi, documentApi } from "@/lib/api";
import { Document, CreateLLMConfigRequest, LLMConfig } from "@shared/types";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedErrorDocument, setSelectedErrorDocument] = useState<Document | null>(null);
  const [selectedDetailsDocument, setSelectedDetailsDocument] = useState<Document | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch stats, documents, and configs
  const { stats, isLoading: isLoadingStats } = useStats();
  const { 
    documents, 
    isLoading: isLoadingDocuments,
    uploadDocuments,
    isUploading,
    uploadError,
    stopProcessing,
    retryProcessing,
    isRetrying
  } = useDocuments();
  
  // Add mutation for deleting all documents
  const deleteAllMutation = useMutation({
    mutationFn: () => documentApi.deleteAllDocuments(),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All documents deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete documents: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });
  
  const llmConfigsQuery = useQuery<LLMConfig[]>({
    queryKey: ["/api/llm-config"],
    initialData: [],
  });
  
  const saveLLMConfigsMutation = useMutation({
    mutationFn: async (configs: CreateLLMConfigRequest[]) => {
      // Delete all existing configs first
      for (const config of (llmConfigsQuery.data || [])) {
        await llmConfigApi.deleteConfig(config.id);
      }
      
      // Then create new configs
      for (const config of configs) {
        await llmConfigApi.saveConfig(config);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/llm-config"] });
      setIsConfigModalOpen(false);
      toast({
        title: "Configuration saved",
        description: "LLM routing configuration has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving configuration",
        description: error.message || "Failed to save LLM routing configuration.",
        variant: "destructive",
      });
    },
  });
  
  // Handle file upload
  const handleUpload = (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("documents", file);
    });
    
    uploadDocuments(formData, {
      onSuccess: () => {
        toast({
          title: "Documents uploaded",
          description: `${files.length} document(s) have been uploaded and are being processed.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Upload failed",
          description: error.message || "Failed to upload documents.",
          variant: "destructive",
        });
      },
    });
  };
  
  // Handle view error
  const handleViewError = (document: Document) => {
    setSelectedErrorDocument(document);
    setIsErrorModalOpen(true);
  };
  
  // Handle retry processing
  const handleRetryProcessing = (documentId: string) => {
    retryProcessing(documentId, {
      onSuccess: () => {
        toast({
          title: "Processing restarted",
          description: "Document processing has been restarted.",
        });
        setIsErrorModalOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Retry failed",
          description: error.message || "Failed to restart document processing.",
          variant: "destructive",
        });
      },
    });
  };
  
  // Handle stop processing
  const handleStopProcessing = (documentId: string) => {
    stopProcessing(documentId, {
      onSuccess: () => {
        toast({
          title: "Processing stopped",
          description: "Document processing has been stopped.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error stopping processing",
          description: error.message || "Failed to stop document processing.",
          variant: "destructive",
        });
      },
    });
  };
  
  // Handle view details - display modal with document details
  const handleViewDetails = (document: Document) => {
    setSelectedDetailsDocument(document);
    setIsDetailsModalOpen(true);
  };
  
  // Filter documents by status
  const activeDocuments = Array.isArray(documents) 
    ? documents.filter(
        (doc: Document) => doc.status === "IN_PROGRESS" || doc.status === "EXTRACTED"
      ) 
    : [];
  
  const recentlyCompletedDocuments = Array.isArray(documents)
    ? documents.filter(
        (doc: Document) => doc.status === "COMPLETED" || doc.status === "FAILED"
      ).slice(0, 5)
    : [];
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-gray-200">
          <button 
            type="button" 
            className="inline-flex items-center justify-center h-10 w-10 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
          >
            <span className="sr-only">Open sidebar</span>
            <i className="ri-menu-line text-xl"></i>
          </button>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Page header */}
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-semibold text-gray-800">Document Processing Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">Monitor and manage your document processing pipeline</p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Button
                  variant="destructive"
                  className="inline-flex items-center gap-2"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete ALL documents? This cannot be undone.")) {
                      deleteAllMutation.mutate();
                    }
                  }}
                  disabled={deleteAllMutation.isPending}
                >
                  {deleteAllMutation.isPending ? "Deleting..." : "Delete All Documents"}
                </Button>
                <Button
                  variant="secondary"
                  className="ml-3 inline-flex items-center gap-2"
                  onClick={() => setIsConfigModalOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                  Configure LLMs
                </Button>
              </div>
            </div>
            
            {/* Stats Overview */}
            <StatsOverview 
              stats={stats as DocumentSystemStats | undefined} 
              isLoading={isLoadingStats} 
            />
            
            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column: Upload + Routing Config */}
              <div className="lg:col-span-1">
                <UploadZone onUpload={handleUpload} isUploading={isUploading} />
                
                <LLMRoutingCard 
                  configs={llmConfigsQuery.data || []}
                  onOpenConfigModal={() => setIsConfigModalOpen(true)}
                  isLoading={llmConfigsQuery.isLoading}
                />
              </div>
              
              {/* Right column: Processing + Completed */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <CardTitle className="text-lg font-medium leading-6 text-gray-900">Active Documents</CardTitle>
                    <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">Real-time processing status</CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 py-5 sm:p-6">
                    {isLoadingDocuments ? (
                      <div className="space-y-6 animate-pulse">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start">
                                <div className="h-6 w-6 bg-gray-200 rounded mr-3"></div>
                                <div>
                                  <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                                </div>
                              </div>
                              <div className="h-5 bg-gray-200 rounded-full w-24"></div>
                            </div>
                            <div className="mt-4">
                              <div className="flex justify-between mb-1">
                                <div className="h-3 bg-gray-200 rounded w-32"></div>
                                <div className="h-3 bg-gray-200 rounded w-8"></div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2"></div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between">
                              <div className="h-3 bg-gray-200 rounded w-40"></div>
                              <div className="h-3 bg-gray-200 rounded w-16"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : activeDocuments.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                          <i className="ri-file-search-line text-xl text-blue-600"></i>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No active documents</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Upload documents to start processing
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {activeDocuments.map((document: Document) => (
                          <DocumentProcessingCard
                            key={document.id}
                            document={document}
                            onStopProcessing={handleStopProcessing}
                            onRetryProcessing={handleRetryProcessing}
                            onViewDetails={handleViewDetails}
                            onViewError={handleViewError}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <RecentlyCompletedTable
                  documents={recentlyCompletedDocuments}
                  onViewResults={handleViewDetails}
                  isLoading={isLoadingDocuments}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Modals */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={(configs) => saveLLMConfigsMutation.mutate(configs)}
        configs={llmConfigsQuery.data || []}
        isLoading={saveLLMConfigsMutation.isPending}
      />
      
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        onRetry={() => selectedErrorDocument && handleRetryProcessing(selectedErrorDocument.id)}
        document={selectedErrorDocument}
        isRetrying={isRetrying}
      />
      
      <DocumentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        document={selectedDetailsDocument}
      />
    </div>
  );
}
