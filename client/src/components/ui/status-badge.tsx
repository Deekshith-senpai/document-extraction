import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DocumentStatus } from "@shared/types";

interface StatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: DocumentStatus) => {
    switch (status) {
      case "IN_PROGRESS":
        return {
          color: "bg-blue-100 text-blue-800",
          dotColor: "bg-blue-600",
          label: "In-Progress",
          pulse: true
        };
      case "EXTRACTED":
        return {
          color: "bg-green-100 text-green-800",
          dotColor: "bg-green-600",
          label: "Extracted",
          pulse: false
        };
      case "STOPPED":
        return {
          color: "bg-amber-100 text-amber-800",
          dotColor: "bg-amber-600",
          label: "Stopped",
          pulse: false
        };
      case "COMPLETED":
        return {
          color: "bg-green-100 text-green-800",
          dotColor: "bg-green-600",
          label: "Completed",
          pulse: false
        };
      case "FAILED":
        return {
          color: "bg-red-100 text-red-800",
          dotColor: "bg-red-600",
          label: "Failed",
          pulse: false
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          dotColor: "bg-gray-600",
          label: status,
          pulse: false
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "rounded-full font-medium flex items-center",
        config.color,
        className
      )}
    >
      <span 
        className={cn(
          "h-1.5 w-1.5 rounded-full mr-1.5", 
          config.dotColor,
          config.pulse && "pulse"
        )}
      />
      {config.label}
    </Badge>
  );
}
