import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { X, Send, Upload } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface UploadFileType {
  file: File;
  id: string;
}

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
}

export function UploadZone({ onUpload, isUploading }: UploadZoneProps) {
  const [uploadQueue, setUploadQueue] = useState<UploadFileType[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Don't add empty files
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: crypto.randomUUID()
    }));
    
    setUploadQueue(prev => [...prev, ...newFiles]);
    
    // Automatically trigger upload if files were dropped directly
    if (acceptedFiles.length > 0 && !isUploading) {
      setTimeout(() => {
        onUpload(acceptedFiles);
      }, 100);
    }
  }, [isUploading, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 25 * 1024 * 1024, // 25MB
  });

  const handleRemoveFile = (id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  const handleUpload = () => {
    if (uploadQueue.length === 0 || isUploading) return;
    onUpload(uploadQueue.map(item => item.file));
    setUploadQueue([]);
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
        <CardTitle className="text-lg font-semibold text-blue-700">Upload Documents</CardTitle>
        <CardDescription>PDF files up to 25MB</CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6">
        <div 
          {...getRootProps()} 
          className={`flex justify-center px-6 pt-6 pb-6 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${
            isDragActive ? "border-blue-400 bg-blue-50/60 shadow-inner" : "border-gray-300 hover:border-blue-300 hover:bg-blue-50/30"
          }`}
        >
          <div className="space-y-2 text-center">
            <Upload className="mx-auto h-12 w-12 text-blue-400" />
            <div className="flex text-sm text-gray-600 justify-center">
              <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-700 focus-within:outline-none">
                <span>Upload a file</span>
                <input {...getInputProps()} className="sr-only" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PDF up to 25MB</p>
          </div>
        </div>

        {uploadQueue.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Upload Queue</h4>
            <div className="space-y-2">
              {uploadQueue.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center py-2 border-b border-gray-200"
                >
                  <div className="flex-shrink-0">
                    <i className="ri-file-pdf-line text-red-500 text-lg"></i>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
                    <p className="text-xs text-gray-500">{formatBytes(item.file.size)}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                    onClick={() => handleRemoveFile(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          type="button"
          className="mt-6 w-full gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
          onClick={handleUpload}
          disabled={uploadQueue.length === 0 || isUploading}
        >
          {isUploading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Start Processing
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
