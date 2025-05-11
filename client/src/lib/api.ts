import { apiRequest } from "./queryClient";
import { Document, LlmRoute } from "@shared/schema";

// Documents API
export const getDocuments = async (): Promise<Document[]> => {
  const res = await apiRequest("GET", "/api/documents");
  const data = await res.json();
  return data.documents;
};

export const getActiveDocuments = async (): Promise<Document[]> => {
  const res = await apiRequest("GET", "/api/documents/active");
  const data = await res.json();
  return data.documents;
};

export const getRecentDocuments = async (limit: number = 5): Promise<Document[]> => {
  const res = await apiRequest("GET", `/api/documents/recent?limit=${limit}`);
  const data = await res.json();
  return data.documents;
};

export const getDocument = async (id: number): Promise<Document> => {
  const res = await apiRequest("GET", `/api/documents/${id}`);
  const data = await res.json();
  return data.document;
};

export const uploadDocument = async (file: File): Promise<Document> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/documents/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to upload document");
  }

  const data = await res.json();
  return data.document;
};

export const processDocument = async (id: number): Promise<void> => {
  await apiRequest("POST", `/api/documents/${id}/process`);
};

export const stopProcessingDocument = async (id: number): Promise<void> => {
  await apiRequest("POST", `/api/documents/${id}/stop`);
};

// LLM Routes API
export const getLlmRoutes = async (): Promise<LlmRoute[]> => {
  const res = await apiRequest("GET", "/api/llm-routes");
  const data = await res.json();
  return data.routes;
};

export const createLlmRoute = async (route: Omit<LlmRoute, "id" | "createdAt">): Promise<LlmRoute> => {
  const res = await apiRequest("POST", "/api/llm-routes", route);
  const data = await res.json();
  return data.route;
};

export const updateLlmRoute = async (id: number, updates: Partial<Omit<LlmRoute, "id" | "createdAt">>): Promise<LlmRoute> => {
  const res = await apiRequest("PATCH", `/api/llm-routes/${id}`, updates);
  const data = await res.json();
  return data.route;
};

export const deleteLlmRoute = async (id: number): Promise<void> => {
  await apiRequest("DELETE", `/api/llm-routes/${id}`);
};

// Stats API
export const getStats = async (): Promise<{
  active: number;
  processed: number;
  failed: number;
  total: number;
}> => {
  const res = await apiRequest("GET", "/api/stats");
  const data = await res.json();
  return data.stats;
};

// Helper to format file sizes
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper to format relative time
export const formatRelativeTime = (date: Date | string | null): string => {
  if (!date) return "";
  
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  
  if (diffSec < 60) return `${diffSec} seconds ago`;
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  
  // If more than 24 hours, show formatted date/time
  return then.toLocaleString();
};
