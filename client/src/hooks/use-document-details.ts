import { useQuery } from "@tanstack/react-query";
import { documentApi } from "@/lib/api";
import { Document } from "@shared/types";

export function useDocumentDetails(documentId?: string | null) {
  const documentDetailsQuery = useQuery({
    queryKey: documentId ? ["/api/documents", documentId] : ["no-document"],
    queryFn: async ({queryKey}) => {
      // Skip if no document ID
      if (queryKey[0] === "no-document" || !documentId) return null;
      const response = await documentApi.getDocumentById(documentId);
      return response.json();
    },
    enabled: !!documentId,
  });

  return {
    document: documentDetailsQuery.data as Document | null,
    isLoading: documentDetailsQuery.isLoading,
    error: documentDetailsQuery.error,
    refetch: documentDetailsQuery.refetch
  };
}