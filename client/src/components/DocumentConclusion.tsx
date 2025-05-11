import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Document } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface DocumentConclusionProps {
  document: Document;
}

export const DocumentConclusion: React.FC<DocumentConclusionProps> = ({ document }) => {
  const metadata = document.metadata || {};
  const extractedData = metadata.extractedData || {};
  
  // Extract conclusion data based on LLM used
  const conclusion = extractedData.conclusion || "No conclusion available.";
  const summary = extractedData.summary || extractedData.contentSummary || "";
  
  // Handle key findings differently based on LLM
  let keyFindings: string[] = [];
  if (extractedData.keyFindings) {
    keyFindings = extractedData.keyFindings;
  } else if (extractedData.keyPoints) {
    keyFindings = extractedData.keyPoints;
  } else if (extractedData.recommendedActions) {
    keyFindings = extractedData.recommendedActions;
  }
  
  // Only show if document is completed
  if (document.status !== 'completed') {
    return null;
  }

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden mb-6">
      <CardHeader className="bg-green-50 px-5 py-4 border-b border-green-100">
        <div className="flex justify-between items-center">
          <h2 className="font-medium text-slate-800 flex items-center">
            <span className="material-icons mr-2 text-green-600">auto_awesome</span>
            Document Conclusion
          </h2>
          {document.llmUsed && (
            <Badge variant="outline" className="bg-slate-100">
              Processed with {document.llmUsed}
            </Badge>
          )}
        </div>
        {summary && <p className="text-sm text-slate-600 mt-2">{summary}</p>}
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="mb-4">
          <h3 className="text-md font-medium text-slate-800 mb-2">Conclusion</h3>
          <p className="text-slate-700">{conclusion}</p>
        </div>
        
        {keyFindings.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium text-slate-800 mb-2">Key Findings</h3>
            <ul className="list-disc pl-5 space-y-1">
              {keyFindings.map((finding, index) => (
                <li key={index} className="text-slate-700">{finding}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Additional extracted data specific to the document type */}
        {document.metadata?.hasFinancialTables && extractedData.tables && extractedData.tables.length > 0 && (
          <div className="mt-4 p-3 bg-slate-50 rounded-md">
            <h4 className="text-sm font-medium text-slate-700 mb-2">
              <span className="material-icons text-sm mr-1 align-middle">table_chart</span>
              Financial Tables Detected
            </h4>
            <ul className="text-xs text-slate-600">
              {extractedData.tables.map((table: any, index: number) => (
                <li key={index} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                  <span>{table.name}</span>
                  <span>{table.rowCount} rows × {table.columnCount} columns</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};