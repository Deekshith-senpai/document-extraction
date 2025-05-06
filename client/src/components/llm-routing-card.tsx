import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { LLMConfig } from "@shared/types";

interface LLMRoutingCardProps {
  configs: LLMConfig[];
  onOpenConfigModal: () => void;
  isLoading: boolean;
}

export function LLMRoutingCard({ configs, onOpenConfigModal, isLoading }: LLMRoutingCardProps) {
  const getLLMBadgeColor = (llmName: string) => {
    switch (llmName.toLowerCase()) {
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

  return (
    <Card className="mt-6">
      <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900">Current LLM Routing</CardTitle>
        <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">Document routing configuration</CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-md p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="w-2/3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded mt-2 w-1/2"></div>
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded mt-2 w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {configs.map((config) => (
              <div key={config.id} className="bg-gray-50 rounded-md p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-gray-500">CONDITION</span>
                    <p className="text-sm font-medium">{config.condition}</p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLLMBadgeColor(config.llmProvider)}`}>
                      {config.llmProvider}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{config.rationale}</p>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="outline"
          className="mt-4 w-full flex items-center justify-center gap-2"
          onClick={onOpenConfigModal}
        >
          <Edit className="h-4 w-4" />
          Edit Configuration
        </Button>
      </CardContent>
    </Card>
  );
}
