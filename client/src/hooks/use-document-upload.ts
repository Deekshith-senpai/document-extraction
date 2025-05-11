import { useState, useCallback } from "react";
import { useToast } from "./use-toast";
import { uploadDocument, processDocument } from "@/lib/api";
import { Document } from "@shared/schema";
import { useQueryClient } from "@tanstack/react-query";

export const useDocumentUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (25MB)
    const MAX_SIZE = 25 * 1024 * 1024; // 25MB in bytes
    if (file.size > MAX_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 25MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  }, [toast]);

  const clearSelectedFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleFileUpload = useCallback(async (): Promise<Document | null> => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress (in a real app, you'd use XHR or fetch with progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      const uploadedDocument = await uploadDocument(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: "File uploaded successfully",
        description: `${selectedFile.name} has been uploaded and is ready for processing.`,
      });

      // Invalidate documents queries
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });

      setSelectedFile(null);
      return uploadedDocument;
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [selectedFile, toast, queryClient]);

  const handleProcessDocument = useCallback(async (documentId: number) => {
    try {
      await processDocument(documentId);
      
      toast({
        title: "Processing started",
        description: "Document processing has been initiated.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      return true;
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to start document processing",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, queryClient]);

  return {
    selectedFile,
    isUploading,
    uploadProgress,
    handleFileSelect,
    clearSelectedFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileUpload,
    handleProcessDocument,
  };
};
