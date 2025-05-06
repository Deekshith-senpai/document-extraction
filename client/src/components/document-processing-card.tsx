import React from "react";
import { Document } from "@shared/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Eye, Info, RefreshCcw, StopCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface DocumentProcessingCardProps {
  document: Document;
  onStopProcessing: (id: string) => void;
  onRetryProcessing: (id: string) => void;
  onViewDetails: (document: Document) => void;
  onViewError: (document: Document) => void;
}

export function DocumentProcessingCard({
  document,
  onStopProcessing,
  onRetryProcessing,
  onViewDetails,
  onViewError
}: DocumentProcessingCardProps) {
  const getProgressPercentage = () => {
    if (!document.progress) return 0;
    return Math.max(0, Math.min(100, document.progress));
  };

  const getTimeString = () => {
    if (!document.createdAt) return "";
    
    try {
      const date = new Date(document.createdAt);
      return `Uploaded ${formatDistanceToNow(date, { addSuffix: true })}`;
    } catch (error) {
      return "";
    }
  };

  const getFileDetails = () => {
    const parts = [];
    
    if (document.pageCount) {
      parts.push(`${document.pageCount} pages`);
    }
    
    if (document.fileSize) {
      // Convert bytes to MB with 1 decimal place
      const sizeMB = (document.fileSize / (1024 * 1024)).toFixed(1);
      parts.push(`${sizeMB} MB`);
    }
    
    parts.push(getTimeString());
    
    return parts.filter(Boolean).join(" • ");
  };

  // Add a reference to see if the card needs to be highlighted
  const isActivelyProcessing = document.status === 'IN_PROGRESS' || document.status === 'EXTRACTED';
  
  // Calculate whether to show a pulsing effect
  const showPulseEffect = isActivelyProcessing && document.progress && document.progress < 100;
  
  return (
    <div className={`border rounded-lg p-4 transition-all duration-300 
      ${isActivelyProcessing 
        ? 'border-primary bg-blue-50 dark:bg-gray-700 dark:border-blue-600' 
        : 'border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <i className="ri-file-pdf-line text-red-500 text-xl mr-3 mt-1"></i>
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{document.fileName}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{getFileDetails()}</p>
          </div>
        </div>
        <div>
          <StatusBadge status={document.status} />
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500 dark:text-gray-400">
            {document.llmProvider ? (
              <>Processing with <span className="font-medium">{document.llmProvider}</span></>
            ) : (
              'Processing...'
            )}
          </span>
          <span className={`font-medium ${showPulseEffect ? 'animate-pulse' : ''} 
            ${document.status === 'FAILED' ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>
            {getProgressPercentage()}%
          </span>
        </div>
        <Progress 
          value={getProgressPercentage()} 
          className={`h-2 ${document.status === "FAILED" ? "bg-red-500" : ""}`}
          aria-label={`${getProgressPercentage()}% complete`}
        />
        {showPulseEffect && (
          <p className="text-xs text-primary dark:text-blue-400 mt-1 italic font-medium">
            {document.status === 'IN_PROGRESS' ? 'Processing in real-time...' : 'Finalizing extraction...'}
          </p>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {document.error ? (
            <div className="flex items-center text-red-500">
              <i className="ri-error-warning-line mr-1"></i>
              <span>Error: {document.error}</span>
            </div>
          ) : (
            <span>
              <span className="font-medium">Current step:</span> {document.currentStep || "Initializing"} 
              {document.stepProgress ? ` (${document.stepProgress})` : ""}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {document.status === "FAILED" && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs" 
                onClick={() => onViewError(document)}
              >
                <Info className="h-3.5 w-3.5 mr-1" />
                Details
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-primary hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300" 
                onClick={() => onRetryProcessing(document.id)}
              >
                <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                Retry
              </Button>
            </>
          )}
          
          {document.status === "IN_PROGRESS" && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs" 
              onClick={() => onStopProcessing(document.id)}
            >
              <StopCircle className="h-3.5 w-3.5 mr-1" />
              Stop
            </Button>
          )}
          
          {(document.status === "EXTRACTED" || document.status === "COMPLETED") && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs" 
              onClick={() => onViewDetails(document)}
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              View details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
