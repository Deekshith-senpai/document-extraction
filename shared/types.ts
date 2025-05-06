export type DocumentStatus = "IN_PROGRESS" | "EXTRACTED" | "STOPPED" | "COMPLETED" | "FAILED";

export interface DocumentSystemStats {
  activeDocuments: number;
  processedToday: number;
  failedDocuments: number;
  systemStatus: boolean;
}

export interface DocumentUploadResponse {
  success: boolean;
  documents: {
    id: string;
    fileName: string;
  }[];
  message?: string;
}

export interface LLMConfig {
  id: number;
  condition: string;
  llmProvider: string;
  rationale: string;
  isActive: boolean;
  priority: number;
}

export interface CreateLLMConfigRequest {
  condition: string;
  llmProvider: string;
  rationale: string;
  isActive?: boolean;
  priority?: number;
}

export interface DocumentUpdate {
  type: "document_update" | "stats_update";
  documentId?: string;
  status?: DocumentStatus;
  progress?: number;
  currentStep?: string;
  stepProgress?: string;
  error?: string;
  llmProvider?: string;
}

export interface Document {
  id: string;
  fileName: string;
  filePath?: string;
  fileSize?: number;
  pageCount?: number;
  status: DocumentStatus;
  progress?: number;
  currentStep?: string;
  stepProgress?: string;
  error?: string;
  errorDetails?: string | any;
  llmProvider?: string;
  extractedContent?: any;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  userId?: number;
}

export interface LLMResponse {
  success: boolean;
  content?: any;
  error?: string;
}

export interface ExtractedDocumentData {
  tables?: {
    title?: string;
    data: any[][];
    location?: { page: number; coordinates?: number[] };
  }[];
  summary?: string;
  keyFindings?: string[];
  metadata?: Record<string, any>;
}
