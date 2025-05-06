import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Document } from "@shared/types";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatBytes } from "@/lib/utils";
import { Check, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { useDocumentDetails } from "@/hooks/use-document-details";

interface DocumentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export function DocumentDetailsModal({ isOpen, onClose, document }: DocumentDetailsModalProps) {
  const { 
    document: documentDetails, 
    isLoading, 
    refetch 
  } = useDocumentDetails(document?.id || null);
  
  useEffect(() => {
    if (isOpen && document) {
      refetch();
    }
  }, [isOpen, document, refetch]);
  
  if (!document) {
    return null;
  }
  
  // Use the detailed document data if available, otherwise use the passed document
  const displayDocument = documentDetails || document;
  
  console.log("Document details:", displayDocument);
  
  // Initialize variables for extracted content
  let extractedData: any = {};
  let hasExtractedData = false;
  
  // Handle various formats of stored extracted content
  if (displayDocument.extractedContent) {
    // Try to parse if it's a string
    if (typeof displayDocument.extractedContent === 'string') {
      try {
        extractedData = JSON.parse(displayDocument.extractedContent);
        console.log("Parsed JSON content:", extractedData);
      } catch (e) {
        console.error("Failed to parse extracted content:", e);
      }
    } 
    // If it's already an object, use it directly
    else if (typeof displayDocument.extractedContent === 'object') {
      extractedData = displayDocument.extractedContent;
      console.log("Object content:", extractedData);
    }
  }
  
  // Check if we have valid data
  hasExtractedData = !!extractedData && 
                     typeof extractedData === 'object' && 
                     Object.keys(extractedData).length > 0;
  
  console.log("Has extracted data:", hasExtractedData, "extractedData type:", typeof extractedData);
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>{displayDocument.fileName}</span>
            {isLoading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            Processed {formatDate(displayDocument.completedAt)} using {displayDocument.llmProvider || "N/A"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
              <p className="text-sm text-gray-500">Loading document details...</p>
            </div>
          ) : (
            <Tabs defaultValue="summary">
              <TabsList className="mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="tables">Tables</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="processing">Processing Info</TabsTrigger>
              </TabsList>
            
              <TabsContent value="summary">
                <div className="space-y-4">
                  <div className="rounded-md bg-blue-50 p-4">
                    <div className="text-sm font-medium text-blue-800 mb-2">Document Summary</div>
                    <div className="text-sm text-blue-700">
                      {hasExtractedData && extractedData.summary ? (
                        extractedData.summary
                      ) : (
                        <div className="flex items-center text-gray-500">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          No summary available
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {hasExtractedData && extractedData.keyFindings && extractedData.keyFindings.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Key Findings</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {extractedData.keyFindings.map((finding: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700">{finding}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="tables">
                {hasExtractedData && extractedData.tables && extractedData.tables.length > 0 ? (
                  <div className="space-y-6">
                    {extractedData.tables.map((table: any, tableIndex: number) => (
                      <div key={tableIndex} className="rounded-md border border-gray-200 overflow-hidden">
                        {table.title && (
                          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">{table.title}</h3>
                            {table.location && (
                              <div className="mt-1 text-xs text-gray-500">
                                Page: {table.location.page || "N/A"}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="overflow-x-auto">
                          <Table>
                            {table.data && table.data.length > 0 && (
                              <>
                                <TableHeader>
                                  <TableRow>
                                    {table.data[0].map((cell: any, cellIndex: number) => (
                                      <TableHead key={cellIndex}>{cell}</TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {table.data.slice(1).map((row: any[], rowIndex: number) => (
                                    <TableRow key={rowIndex}>
                                      {row.map((cell, cellIndex) => (
                                        <TableCell key={cellIndex}>{cell}</TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </>
                            )}
                          </Table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                      <AlertTriangle className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tables found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No table data was extracted from this document
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="metadata">
                <div className="rounded-md border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">File Name</TableCell>
                        <TableCell>{displayDocument.fileName}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">File Size</TableCell>
                        <TableCell>{displayDocument.fileSize ? formatBytes(displayDocument.fileSize) : 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Page Count</TableCell>
                        <TableCell>{displayDocument.pageCount || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Created</TableCell>
                        <TableCell>{formatDate(displayDocument.createdAt)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Completed</TableCell>
                        <TableCell>{formatDate(displayDocument.completedAt)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">LLM Provider</TableCell>
                        <TableCell>{displayDocument.llmProvider || 'N/A'}</TableCell>
                      </TableRow>
                      {hasExtractedData && extractedData.metadata && Object.entries(extractedData.metadata).map(([key, value]: [string, any]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium">{key}</TableCell>
                          <TableCell>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="processing">
                <div className="rounded-md border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Status</TableCell>
                        <TableCell className="flex items-center">
                          {displayDocument.status === "COMPLETED" ? (
                            <span className="inline-flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-green-600">Completed</span>
                            </span>
                          ) : displayDocument.status === "FAILED" ? (
                            <span className="inline-flex items-center">
                              <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                              <span className="text-red-600">Failed</span>
                            </span>
                          ) : (
                            displayDocument.status
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Processing Time</TableCell>
                        <TableCell>
                          {displayDocument.createdAt && displayDocument.completedAt ? (
                            `${Math.round((new Date(displayDocument.completedAt).getTime() - new Date(displayDocument.createdAt).getTime()) / 1000)} seconds`
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>
                      {displayDocument.error && (
                        <TableRow>
                          <TableCell className="font-medium text-red-600">Error</TableCell>
                          <TableCell className="text-red-600">{displayDocument.error}</TableCell>
                        </TableRow>
                      )}
                      {displayDocument.currentStep && (
                        <TableRow>
                          <TableCell className="font-medium">Last Step</TableCell>
                          <TableCell>{displayDocument.currentStep}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}