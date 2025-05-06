import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentSystemStats } from "@shared/types";
import { FileText, CheckCircle, AlertTriangle, Radar } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  pulseStatus?: boolean;
}

function StatCard({ title, value, icon, iconBgColor, iconColor, pulseStatus }: StatCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-lg p-3 shadow-sm`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                {pulseStatus !== undefined ? (
                  <div className="text-lg font-semibold text-gray-900">
                    <span className="inline-flex items-center">
                      <span className={`h-2 w-2 rounded-full ${pulseStatus ? "bg-green-500 pulse" : "bg-red-500"} mr-2`}></span>
                      {value}
                    </span>
                  </div>
                ) : (
                  <div className="text-lg font-semibold text-gray-900">{value}</div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsOverviewProps {
  stats: DocumentSystemStats | undefined;
  isLoading: boolean;
}

export function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4 mb-8 w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-md">
            <CardContent className="px-4 py-5 sm:p-6 flex animate-pulse">
              <div className="h-12 w-12 rounded-md bg-gray-200"></div>
              <div className="ml-5 space-y-2 w-full">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4 mb-8 w-full">
      <StatCard
        title="Active Documents"
        value={stats.activeDocuments}
        icon={<FileText className="text-blue-600 h-6 w-6" />}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
      />
      
      <StatCard
        title="Processed Today"
        value={stats.processedToday}
        icon={<CheckCircle className="text-green-600 h-6 w-6" />}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
      />
      
      <StatCard
        title="Failed Documents"
        value={stats.failedDocuments}
        icon={<AlertTriangle className="text-red-600 h-6 w-6" />}
        iconBgColor="bg-red-100"
        iconColor="text-red-600"
      />
      
      <StatCard
        title="System Status"
        value={stats.systemStatus ? "Operational" : "Maintenance"}
        icon={<Radar className="text-purple-600 h-6 w-6" />}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
        pulseStatus={stats.systemStatus}
      />
    </div>
  );
}
