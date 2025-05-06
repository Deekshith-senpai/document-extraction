import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Document } from "@shared/types";
import { formatDistanceToNow } from "date-fns";

interface RecentlyCompletedTableProps {
  documents: Document[];
  onViewResults: (document: Document) => void;
  isLoading: boolean;
}

export function RecentlyCompletedTable({ 
  documents, 
  onViewResults,
  isLoading
}: RecentlyCompletedTableProps) {
  const getLLMBadgeColor = (llmName: string) => {
    switch (llmName?.toLowerCase()) {
      case "gpt-4":
      case "gpt-4o":
        return "bg-blue-100 text-blue-800";
      case "claude":
      case "claude-3":
      case "claude-3-7-sonnet-20250219":
        return "bg-indigo-100 text-indigo-800";
      case "gemini":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Unknown time";
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900">Recently Completed</CardTitle>
        <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">Last 5 completed documents</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed with</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</TableHead>
                <TableHead className="relative px-6 py-3"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-200"></div>
                        <div className="ml-4">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-3 mt-1 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                    No completed documents yet
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <i className="ri-file-pdf-line text-red-500 text-lg"></i>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{doc.fileName}</div>
                          <div className="text-xs text-gray-500">{doc.fileSize ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB` : ""}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLLMBadgeColor(doc.llmProvider || "")}`}>
                        {doc.llmProvider || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={doc.status} />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.completedAt ? getTimeAgo(doc.completedAt) : ""}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          onViewResults(doc);
                        }}
                        className="text-primary hover:text-blue-700"
                      >
                        View results
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
