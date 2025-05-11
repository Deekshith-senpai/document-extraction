import React from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getDocument, processDocument, stopProcessingDocument } from "@/lib/api";
import { DocumentDetails } from "@/components/DocumentDetails";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const DocumentDetailsPage: React.FC = () => {
  const [_, params] = useRoute("/documents/:id");
  const documentId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  
  const { data: document, isLoading, error } = useQuery({
    queryKey: ['/api/documents', documentId],
    queryFn: () => getDocument(documentId!),
    enabled: documentId !== null,
    refetchInterval: (data) => {
      // @ts-ignore - Check if document is still processing
      if (data && data.status === 'processing') {
        return 2000;
      }
      return false;
    }
  });

  const processMutation = useMutation({
    mutationFn: processDocument,
    onSuccess: () => {
      toast({
        title: "Processing started",
        description: "Document processing has been initiated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents', documentId] });
    },
    onError: (err) => {
      toast({
        title: "Error starting processing",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  });

  const stopProcessingMutation = useMutation({
    mutationFn: stopProcessingDocument,
    onSuccess: () => {
      toast({
        title: "Processing stopped",
        description: "Document processing has been stopped.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents', documentId] });
    },
    onError: (err) => {
      toast({
        title: "Error stopping processing",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-slate-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          <h2 className="text-lg font-medium">Error loading document</h2>
          <p className="text-sm mt-1">
            {error instanceof Error ? error.message : "Document not found"}
          </p>
        </div>
        <Button onClick={() => window.history.back()}>
          <span className="material-icons mr-2">arrow_back</span>
          Go Back
        </Button>
      </div>
    );
  }

  const handleProcessDocument = (id: number) => {
    processMutation.mutate(id);
  };

  const handleStopProcessing = (id: number) => {
    stopProcessingMutation.mutate(id);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            className="mb-2"
            onClick={() => window.history.back()}
          >
            <span className="material-icons mr-2">arrow_back</span>
            Back to Documents
          </Button>
          <h1 className="text-2xl font-semibold text-slate-800">Document Details</h1>
        </div>
      </div>

      <DocumentDetails 
        document={document} 
        onProcessDocument={handleProcessDocument}
        onStopProcessing={handleStopProcessing}
      />
    </div>
  );
};

export default DocumentDetailsPage;