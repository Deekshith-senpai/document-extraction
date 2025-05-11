import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatFileSize } from "@/lib/api";
import { useDocumentUpload } from "@/hooks/use-document-upload";

interface UploadAreaProps {
  onDocumentUploaded?: (documentId: number) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onDocumentUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    selectedFile,
    isUploading,
    uploadProgress,
    handleFileSelect,
    clearSelectedFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileUpload,
    handleProcessDocument,
  } = useDocumentUpload();

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const startProcessing = async () => {
    const document = await handleFileUpload();
    if (document && document.id) {
      const success = await handleProcessDocument(document.id);
      if (success && onDocumentUploaded) {
        onDocumentUploaded(document.id);
      }
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden">
      <CardHeader className="bg-primary-50 px-5 py-4 border-b border-primary-100">
        <h2 className="font-medium text-primary-800 flex items-center">
          <span className="material-icons mr-2 text-primary-600">upload_file</span>
          Upload Documents
        </h2>
        <p className="text-sm text-slate-500 mt-1">PDF files up to 25MB</p>
      </CardHeader>
      <CardContent className="p-5">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={onFileChange}
          accept="application/pdf"
        />

        {/* Drop zone */}
        <div
          className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-300 transition-colors cursor-pointer"
          onClick={openFileSelector}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            <span className="material-icons text-5xl text-slate-400 mb-4">cloud_upload</span>
            <p className="mb-2 text-slate-700">Upload a file or drag and drop</p>
            <p className="text-xs text-slate-500 mb-4">PDF up to 25MB</p>
            <Button
              type="button"
              className="bg-primary hover:bg-primary-700 text-white font-medium inline-flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                openFileSelector();
              }}
            >
              <span className="material-icons mr-2 text-sm">attach_file</span>
              <span>Select File</span>
            </Button>
          </div>
        </div>

        {/* Selected file display */}
        {selectedFile && (
          <div className="mt-4">
            <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="material-icons text-primary-600 mr-3">description</span>
              <div className="mr-auto">
                <p className="text-sm font-medium text-slate-700 truncate w-40">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelectedFile();
                }}
              >
                <span className="material-icons">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Upload progress indicator */}
        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div
                className="bg-primary-600 h-1.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-1 text-right">{uploadProgress}%</p>
          </div>
        )}

        {/* Start processing button */}
        <div className="mt-5">
          <Button
            type="button"
            className="w-full bg-primary hover:bg-primary-700 text-white font-medium inline-flex items-center justify-center"
            disabled={!selectedFile || isUploading}
            onClick={startProcessing}
          >
            <span className="material-icons mr-2">play_arrow</span>
            <span>Start Processing</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadArea;
