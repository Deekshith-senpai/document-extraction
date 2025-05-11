import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getDocuments } from "@/lib/api";
import { formatFileSize, formatRelativeTime } from "@/lib/api";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export const DocumentHistory: React.FC = () => {
  // Fetch document history
  const { data: documents, isLoading, isError } = useQuery({
    queryKey: ["/api/documents"],
    queryFn: getDocuments,
  });

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow mt-8">
        <CardHeader className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-medium text-slate-800 flex items-center">
            <span className="material-icons mr-2 text-slate-600">history</span>
            Document Processing History
          </h2>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex items-center justify-center h-32 text-slate-500">
            Loading document history...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-white rounded-lg shadow mt-8">
        <CardHeader className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-medium text-slate-800 flex items-center">
            <span className="material-icons mr-2 text-slate-600">history</span>
            Document Processing History
          </h2>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex items-center justify-center h-32 text-red-500">
            <span className="material-icons mr-2">error</span>
            Failed to load document history.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow mt-8">
      <CardHeader className="px-5 py-4 border-b border-slate-200">
        <h2 className="font-medium text-slate-800 flex items-center">
          <span className="material-icons mr-2 text-slate-600">history</span>
          Document Processing History
        </h2>
      </CardHeader>
      <CardContent className="p-5">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Document
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Size
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  LLM Used
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Processing Time
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Processed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {documents && documents.length > 0 ? (
                documents.map((doc) => {
                  // Calculate processing time in seconds if available
                  const processingTime = doc.processingStartedAt && doc.processingCompletedAt
                    ? Math.round((new Date(doc.processingCompletedAt).getTime() - new Date(doc.processingStartedAt).getTime()) / 1000)
                    : null;
                    
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="material-icons text-slate-400 mr-2">
                            description
                          </span>
                          <div>
                            <Link to={`/documents/${doc.id}`}>
                              <div className="text-sm font-medium text-primary hover:text-primary-700 cursor-pointer">
                                {doc.originalName || doc.name}
                              </div>
                            </Link>
                            <div className="text-xs text-slate-500 mt-1">
                              {doc.metadata?.pageCount ? `${doc.metadata.pageCount} pages` : "Unknown pages"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-slate-700">{formatFileSize(doc.size)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {doc.llmUsed ? (
                          <Badge className={`${
                            doc.llmUsed === "GPT-4" ? "bg-emerald-100 text-emerald-800" :
                            doc.llmUsed === "Claude 3" ? "bg-purple-100 text-purple-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {doc.llmUsed}
                          </Badge>
                        ) : (
                          <span className="text-sm text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          doc.status === "completed" ? "bg-green-100 text-green-800" :
                          doc.status === "processing" ? "bg-blue-100 text-blue-800" :
                          doc.status === "failed" ? "bg-red-100 text-red-800" :
                          "bg-slate-100 text-slate-800"
                        }`}>
                          {doc.status || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {processingTime !== null ? (
                          <div className="text-sm text-slate-700">{processingTime}s</div>
                        ) : (
                          <div className="text-sm text-slate-500">-</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-slate-500">
                          {formatRelativeTime(doc.processingCompletedAt || doc.createdAt)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-sm text-slate-500">
                    No documents have been processed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentHistory;