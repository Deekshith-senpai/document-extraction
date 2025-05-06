import { useState } from "react";
import { UploadZone } from "@/components/upload-zone";
import { StatsOverview } from "@/components/stats-overview";
import { useDocuments, useStats } from "@/hooks/use-documents";
import { RecentlyCompletedTable } from "@/components/recently-completed-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LLMRoutingCard } from "@/components/llm-routing-card";
import { ConfigModal } from "@/components/config-modal";
import { DocumentDetailsModal } from "@/components/document-details-modal";
import { ErrorModal } from "@/components/error-modal";
import { llmConfigApi } from "@/lib/api";
import { CreateLLMConfigRequest, LLMConfig, Document, DocumentSystemStats } from "@shared/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DocumentProcessingCard } from "@/components/document-processing-card";
import { Menu, X, Upload, History, Cpu } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { useMobile } from "@/hooks/use-mobile";

function App() {
  const [activeTab, setActiveTab] = useState("upload");
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedErrorDocument, setSelectedErrorDocument] = useState<Document | null>(null);
  const [selectedDetailsDocument, setSelectedDetailsDocument] = useState<Document | null>(null);
  const { toast } = useToast();
  const localQueryClient = useQueryClient();
  const { isMobile, isSidebarOpen, toggleSidebar } = useMobile();
  
  // Fetch stats, documents, and configs
  const { stats, isLoading: isLoadingStats } = useStats();
  const typedStats = stats as DocumentSystemStats | undefined;
  const { 
    documents, 
    isLoading: isLoadingDocuments,
    uploadDocuments,
    isUploading,
    stopProcessing,
    retryProcessing,
    isRetrying
  } = useDocuments();
  
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
      localQueryClient.invalidateQueries({ queryKey: ["/api/llm-config"] });
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
        (doc: Document) => doc.status === "COMPLETED" || doc.status === "FAILED" || doc.status === "STOPPED"
      )
    : [];

  return (
    <div className="min-h-screen flex flex-nowrap overflow-hidden">
      {/* Sidebar (hidden on mobile) */}
      {!isMobile && <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />}
      
      {/* Mobile Menu Button (visible only on mobile) */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}
      
      {/* Mobile Sidebar (visible only when toggled) */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="relative h-full w-64">
            <Sidebar activeTab={activeTab} onTabChange={(tab) => {
              setActiveTab(tab);
              toggleSidebar();
            }} />
            <button
              className="absolute top-4 right-4 text-white"
              onClick={toggleSidebar}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className={`flex-1 min-h-screen ${isMobile ? 'w-full' : 'ml-0'}`}>
        <div className="flex justify-center w-full px-4 py-6">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex flex-col space-y-6">
              <div className="text-center mb-4">
                <h1 className="text-3xl md:text-4xl gradient-heading mb-3 font-bold">Document Processing System</h1>
                <p className="text-center text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                  Upload and process documents using AI-powered extraction and analysis
                </p>
              </div>
              
              <StatsOverview stats={typedStats} isLoading={isLoadingStats} />
              
              {/* Mobile Tabs (visible only on mobile) */}
              {isMobile && (
                <Tabs defaultValue="upload" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 p-1 rounded-xl bg-gray-100 mb-4">
                    <TabsTrigger value="upload" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary">
                      <Upload size={16} />
                      <span>Upload</span>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary">
                      <History size={16} />
                      <span>History</span>
                    </TabsTrigger>
                    <TabsTrigger value="llm" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary">
                      <Cpu size={16} />
                      <span>LLM Config</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
              
              {/* Main content tabs */}
              <Tabs defaultValue="upload" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                
                {/* Upload tab content */}
                <TabsContent value="upload" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto">
                    <UploadZone onUpload={handleUpload} isUploading={isUploading} />
                    
                    <Card className="shadow-md hover:shadow-lg transition-all duration-300">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
                        <CardTitle className="text-lg font-semibold text-blue-700">Active Document Processing</CardTitle>
                        <CardDescription>Documents currently being processed</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        {isLoadingDocuments ? (
                          <div className="py-10 text-center">
                            <div className="animate-spin inline-block w-6 h-6 border-2 border-t-blue-500 border-blue-300 rounded-full mb-2"></div>
                            <p>Loading active documents...</p>
                          </div>
                        ) : activeDocuments.length === 0 ? (
                          <div className="py-10 text-center text-gray-500">
                            <Upload className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p>No documents being processed</p>
                            <p className="text-sm text-gray-400 mt-1">Upload a document to get started</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
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
                  </div>
                </TabsContent>
                
                {/* History tab content */}
                <TabsContent value="history" className="space-y-6">
                  <Card className="shadow-md hover:shadow-lg transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
                      <CardTitle className="text-lg font-semibold text-blue-700">Document History</CardTitle>
                      <CardDescription>All processed documents and their results</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {isLoadingDocuments ? (
                        <div className="py-10 text-center">
                          <div className="animate-spin inline-block w-6 h-6 border-2 border-t-blue-500 border-blue-300 rounded-full mb-2"></div>
                          <p>Loading document history...</p>
                        </div>
                      ) : recentlyCompletedDocuments.length === 0 ? (
                        <div className="py-10 text-center text-gray-500">
                          <History className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <p>No documents have been processed yet</p>
                          <p className="text-sm text-gray-400 mt-1">Your processed documents will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <RecentlyCompletedTable
                            documents={recentlyCompletedDocuments}
                            onViewResults={handleViewDetails}
                            isLoading={isLoadingDocuments}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* LLM Configuration tab content */}
                <TabsContent value="llm" className="space-y-6">
                  <Card className="shadow-md hover:shadow-lg transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
                      <CardTitle className="text-lg font-semibold text-blue-700">LLM Routing Configuration</CardTitle>
                      <CardDescription>Manage how documents are routed to different AI providers</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <LLMRoutingCard 
                        configs={llmConfigsQuery.data || []}
                        onOpenConfigModal={() => setIsConfigModalOpen(true)}
                        isLoading={llmConfigsQuery.isLoading}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
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
        </div>
      </div>
    </div>
  );
}

export default App;