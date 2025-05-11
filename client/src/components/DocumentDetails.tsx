import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Document } from "@shared/schema";
import { formatFileSize, formatRelativeTime } from "@/lib/api";
import { DocumentConclusion } from "./DocumentConclusion";

interface DocumentDetailsProps {
  document: Document;
  onProcessDocument?: (id: number) => void;
  onStopProcessing?: (id: number) => void;
}

export const DocumentDetails: React.FC<DocumentDetailsProps> = ({ 
  document, 
  onProcessDocument,
  onStopProcessing
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusBadgeClass = () => {
    switch (document.status) {
      case 'processing':
        return 'bg-amber-100 text-amber-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusText = () => {
    switch (document.status) {
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Uploaded';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white rounded-lg shadow overflow-hidden">
        <CardHeader className="bg-slate-50 px-5 py-4 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <h2 className="font-medium text-slate-800 flex items-center">
              <span className="material-icons mr-2 text-slate-600">description</span>
              {document.originalName || document.name}
            </h2>
            <span 
              className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass()}`}
            >
              {getStatusText()}
              {document.status === 'processing' && (
                <span className="inline-block ml-1">
                  {document.progress}%
                </span>
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
            <span>{formatFileSize(document.size)}</span>
            <span>•</span>
            <span>Uploaded {formatRelativeTime(document.createdAt)}</span>
            {document.processingCompletedAt && (
              <>
                <span>•</span>
                <span>Processed {formatRelativeTime(document.processingCompletedAt)}</span>
              </>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-5">
          {document.status === 'uploaded' && onProcessDocument && (
            <Button 
              onClick={() => onProcessDocument(document.id)}
              className="w-full mb-3"
            >
              <span className="material-icons mr-2 text-sm">play_arrow</span>
              Process Document
            </Button>
          )}
          
          {document.status === 'processing' && onStopProcessing && (
            <Button 
              variant="destructive" 
              onClick={() => onStopProcessing(document.id)}
              className="w-full mb-3"
            >
              <span className="material-icons mr-2 text-sm">stop</span>
              Stop Processing
            </Button>
          )}
          
          {document.status === 'processing' && (
            <div className="mb-3">
              <div className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                <span>Processing...</span>
                <span>{document.progress || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full" 
                  style={{ width: `${document.progress || 0}%` }}
                ></div>
              </div>
              {document.stage && (
                <p className="text-xs text-slate-500 mt-1">{document.stage}</p>
              )}
            </div>
          )}
          
          {document.status === 'failed' && document.error && (
            <div className="bg-red-50 border border-red-100 rounded-md p-3 mb-3">
              <h3 className="text-sm font-medium text-red-800 mb-1">Processing Error</h3>
              <p className="text-xs text-red-700">{document.error}</p>
            </div>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => setShowDetails(!showDetails)}
            className="w-full"
          >
            <span className="material-icons mr-2 text-sm">
              {showDetails ? 'expand_less' : 'expand_more'}
            </span>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          
          {showDetails && (
            <div className="mt-4 text-sm">
              <h3 className="font-medium text-slate-800 mb-2">Document Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Document ID:</span>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{document.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">File Path:</span>
                  <span className="font-mono text-xs truncate max-w-[200px]">{document.path}</span>
                </div>
                {document.metadata?.pageCount && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pages:</span>
                    <span>{document.metadata.pageCount}</span>
                  </div>
                )}
                {document.llmUsed && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Processed with:</span>
                    <span>{document.llmUsed}</span>
                  </div>
                )}
                {document.status === 'completed' && document.processingStartedAt && document.processingCompletedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Processing Time:</span>
                    <span>
                      {Math.round((new Date(document.processingCompletedAt).getTime() - 
                                 new Date(document.processingStartedAt).getTime()) / 1000)} seconds
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {document.status === 'completed' && document.metadata?.extractedData && (
        <DocumentConclusion document={document} />
      )}
    </div>
  );
};