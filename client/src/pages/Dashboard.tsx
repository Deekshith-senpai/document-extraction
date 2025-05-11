import React, { useState } from "react";
import StatusCard from "@/components/StatusCard";
import UploadArea from "@/components/UploadArea";
import ProcessingStatus from "@/components/ProcessingStatus";
import LLMConfig from "@/components/LLMConfig";
import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/lib/api";

const Dashboard: React.FC = () => {
  const [uploadedDocIds, setUploadedDocIds] = useState<number[]>([]);
  
  // Fetch system stats
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: getStats,
    refetchInterval: 10000 // Refresh every 10 seconds
  });
  
  const stats = statsData || { active: 0, processed: 0, failed: 0, total: 0 };
  
  // Track newly uploaded documents
  const handleDocumentUploaded = (documentId: number) => {
    setUploadedDocIds(prev => [...prev, documentId]);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-slate-800">Document Processing System</h1>
        <p className="text-slate-500 mt-1">Upload and process documents using AI-powered extraction and analysis</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatusCard
          title="Active Documents"
          value={isStatsLoading ? "..." : stats.active}
          icon="description"
          variant="primary"
        />
        <StatusCard
          title="Processed Today"
          value={isStatsLoading ? "..." : stats.processed}
          icon="check_circle"
          variant="green"
        />
        <StatusCard
          title="Failed Documents"
          value={isStatsLoading ? "..." : stats.failed}
          icon="error"
          variant="red"
        />
        <StatusCard
          title="System Status"
          value="Operational"
          icon="podcasts"
          variant="green"
        />
      </div>

      {/* Work area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UploadArea onDocumentUploaded={handleDocumentUploaded} />
        <ProcessingStatus watchDocumentIds={uploadedDocIds} />
      </div>

      {/* LLM configuration */}
      <LLMConfig />
    </div>
  );
};

export default Dashboard;
