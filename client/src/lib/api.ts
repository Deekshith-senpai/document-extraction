import { apiRequest } from "./queryClient";
import { 
  DocumentUploadResponse, 
  LLMConfig, 
  CreateLLMConfigRequest,
  DocumentStatus
} from "@shared/types";

export const documentApi = {
  uploadDocuments: async (formData: FormData): Promise<DocumentUploadResponse> => {
    const response = await fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || response.statusText);
    }
    
    return response.json();
  },
  
  getDocuments: async (params?: { status?: DocumentStatus }): Promise<Response> => {
    let url = "/api/documents";
    if (params?.status) {
      url += `?status=${params.status}`;
    }
    return apiRequest("GET", url);
  },
  
  getDocumentById: async (id: string): Promise<Response> => {
    return apiRequest("GET", `/api/documents/${id}`);
  },
  
  stopProcessing: async (id: string): Promise<Response> => {
    return apiRequest("POST", `/api/documents/${id}/stop`);
  },
  
  retryProcessing: async (id: string): Promise<Response> => {
    return apiRequest("POST", `/api/documents/${id}/retry`);
  },
  
  deleteAllDocuments: async (): Promise<Response> => {
    return apiRequest("DELETE", "/api/documents/all");
  }
};

export const llmConfigApi = {
  getConfigs: async (): Promise<Response> => {
    return apiRequest("GET", "/api/llm-config");
  },
  
  saveConfig: async (config: CreateLLMConfigRequest): Promise<Response> => {
    return apiRequest("POST", "/api/llm-config", config);
  },
  
  updateConfig: async (id: number, config: Partial<CreateLLMConfigRequest>): Promise<Response> => {
    return apiRequest("PATCH", `/api/llm-config/${id}`, config);
  },
  
  deleteConfig: async (id: number): Promise<Response> => {
    return apiRequest("DELETE", `/api/llm-config/${id}`);
  }
};

export const statsApi = {
  getStats: async (): Promise<Response> => {
    return apiRequest("GET", "/api/stats");
  }
};
