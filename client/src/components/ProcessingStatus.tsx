import React, { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/api";
import { useProcessingStatus } from "@/hooks/use-processing-status";
import { useQuery } from "@tanstack/react-query";
import { getRecentDocuments } from "@/lib/api";

interface ProcessingStatusProps {
  watchDocumentIds?: number[];
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ watchDocumentIds = [] }) => {
  const { activeDocuments, subscribeToDocument, unsubscribeFromDocument } = useProcessingStatus(watchDocumentIds);
  
  // Fetch recent documents
  const { data: recentDocsData } = useQuery({
    queryKey: ["/api/documents/recent"],
    queryFn: () => getRecentDocuments(5),
  });
  
  const recentDocuments = recentDocsData || [];
  
  // Subscribe to documents when IDs change
  useEffect(() => {
    watchDocumentIds.forEach(id => {
      subscribeToDocument(id);
    });
    
    return () => {
      watchDocumentIds.forEach(id => {
        unsubscribeFromDocument(id);
      });
    };
  }, [watchDocumentIds, subscribeToDocument, unsubscribeFromDocument]);
  
  // Calculate processing time for active documents
  const getProcessingTime = (doc: any) => {
    if (!doc.processingStartedAt) return "Waiting to start...";
    
    const startTime = new Date(doc.processingStartedAt).getTime();
    const now = new Date().getTime();
    const diffSeconds = Math.floor((now - startTime) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds} seconds`;
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };
  
  // Calculate duration for completed documents
  const getProcessingDuration = (doc: any) => {
    if (!doc.processingStartedAt || !doc.processingCompletedAt) return "";
    
    const startTime = new Date(doc.processingStartedAt).getTime();
    const endTime = new Date(doc.processingCompletedAt).getTime();
    const diffSeconds = Math.floor((endTime - startTime) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s`;
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden">
      <CardHeader className="bg-primary-50 px-5 py-4 border-b border-primary-100">
        <h2 className="font-medium text-primary-800 flex items-center">
          <span className="material-icons mr-2 text-primary-600">sync</span>
          Active Document Processing
        </h2>
        <p className="text-sm text-slate-500 mt-1">Documents currently being processed</p>
      </CardHeader>

      {/* Empty state or active documents */}
      {activeDocuments.length === 0 ? (
        <div className="p-8 flex flex-col items-center justify-center text-center border-b border-slate-100">
          <span className="material-icons text-5xl text-slate-300 mb-4">hourglass_empty</span>
          <p className="text-slate-600 mb-1">No documents being processed</p>
          <p className="text-sm text-slate-500">Upload a document to get started</p>
        </div>
      ) : (
        <div className="border-b border-slate-100">
          {activeDocuments.map((doc) => (
            <div key={doc.id} className="border-b border-slate-100 p-4 last:border-0">
              <div className="flex items-center">
                <span className="material-icons text-primary-600 mr-3">description</span>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-slate-700">{doc.originalName || doc.name}</p>
                    <span 
                      className={`text-xs px-2 py-1 rounded-full ${
                        doc.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                        doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {doc.status === 'processing' ? 'Processing' : 
                        doc.status === 'completed' ? 'Completed' : 'Failed'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full"
                        style={{ width: `${doc.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-slate-500">{doc.stage || 'Initializing...'}</p>
                    <p className="text-xs text-slate-500">{doc.progress || 0}%</p>
                  </div>
                  {/* Processing details */}
                  <div className="mt-2 text-xs text-slate-600">
                    {doc.llmUsed && (
                      <p>Using <span className="font-medium">{doc.llmUsed}</span> for processing</p>
                    )}
                    <p className="text-slate-500">Time elapsed: {getProcessingTime(doc)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent documents list */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-slate-700 mb-3">Recently Processed</h3>
        
        {recentDocuments.length === 0 ? (
          <div className="text-center py-4 text-slate-500 text-sm">
            No documents have been processed recently
          </div>
        ) : (
          <div>
            {recentDocuments.map((doc) => (
              <a 
                href={`/documents/${doc.id}`} 
                key={doc.id} 
                className="block mb-3 last:mb-0 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="material-icons text-slate-400 mr-3">description</span>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-slate-700">{doc.originalName}</p>
                      <span 
                        className={`text-xs px-2 py-1 rounded-full ${
                          doc.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {doc.status === 'completed' ? 'Completed' : 'Failed'}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-slate-500">{formatRelativeTime(doc.processingCompletedAt)}</p>
                      <p className="text-xs text-slate-500">{getProcessingDuration(doc)}</p>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProcessingStatus;
