import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Document } from "@shared/types";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  document: Document | null;
  isRetrying: boolean;
}

export function ErrorModal({ isOpen, onClose, onRetry, document, isRetrying }: ErrorModalProps) {
  if (!document) return null;

  // Parse error details if available
  let errorDetails: { message: string; pages?: { page: number; issue: string }[] } | null = null;
  
  try {
    if (document.errorDetails) {
      errorDetails = typeof document.errorDetails === "string" 
        ? JSON.parse(document.errorDetails) 
        : document.errorDetails;
    }
  } catch (e) {
    console.error("Error parsing error details:", e);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="text-red-600 h-5 w-5" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <DialogTitle className="text-lg leading-6 font-medium text-gray-900">
                Processing Error
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                There was an error processing <span className="font-medium">{document.fileName}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-5 bg-gray-50 rounded-md p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Error Details</h4>
          <div className="mt-2 text-sm text-gray-600">
            <p className="mb-2">{document.error || "Unknown error occurred during processing."}</p>
            
            {errorDetails?.pages && errorDetails.pages.length > 0 && (
              <>
                <p className="mt-2 mb-1">Issues were found on the following pages:</p>
                <ul className="list-disc pl-5 text-xs text-gray-500 space-y-1">
                  {errorDetails.pages.map((page, index) => (
                    <li key={index}>
                      Page {page.page}: {page.issue}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          
          {errorDetails?.message && (
            <div className="mt-4 text-sm">
              <h4 className="font-medium text-gray-900">Recommended Actions:</h4>
              <ul className="list-disc pl-5 text-xs text-gray-500 space-y-1 mt-2">
                {errorDetails.message.split('. ').filter(Boolean).map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:flex sm:flex-row-reverse">
          <Button 
            onClick={onRetry} 
            className="w-full inline-flex justify-center sm:ml-3 sm:w-auto"
            disabled={isRetrying}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isRetrying ? "Retrying..." : "Retry Processing"}
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center sm:mt-0 sm:ml-3 sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
