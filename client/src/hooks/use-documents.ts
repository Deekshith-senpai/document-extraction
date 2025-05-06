import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "@/lib/api";
import { useWebSocket } from "@/lib/websocket";
import { useEffect } from "react";
import { DocumentStatus } from "@shared/types";

export function useDocuments(status?: DocumentStatus) {
  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();
  
  const documentsQuery = useQuery({
    queryKey: ["/api/documents", status],
    refetchInterval: 5000, // Polling fallback in case WebSockets fail
  });
  
  // Update documents cache when receiving WebSocket updates
  useEffect(() => {
    if (lastMessage && lastMessage.type === "document_update") {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    }
  }, [lastMessage, queryClient]);
  
  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => documentApi.uploadDocuments(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
  
  const stopProcessingMutation = useMutation({
    mutationFn: (id: string) => documentApi.stopProcessing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
  
  const retryProcessingMutation = useMutation({
    mutationFn: (id: string) => documentApi.retryProcessing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
  
  return {
    documents: documentsQuery.data,
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    uploadDocuments: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
    stopProcessing: stopProcessingMutation.mutate,
    isStoppingProcessing: stopProcessingMutation.isPending,
    retryProcessing: retryProcessingMutation.mutate,
    isRetrying: retryProcessingMutation.isPending
  };
}

export function useStats() {
  const { lastMessage } = useWebSocket();
  const queryClient = useQueryClient();
  
  const statsQuery = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 10000, // Polling fallback
  });
  
  // Update stats cache when receiving WebSocket updates
  useEffect(() => {
    if (lastMessage && lastMessage.type === "stats_update") {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    }
  }, [lastMessage, queryClient]);
  
  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    error: statsQuery.error
  };
}
