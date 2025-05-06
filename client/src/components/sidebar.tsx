import React from "react";
import { cn } from "@/lib/utils";
import { 
  Upload, 
  History, 
  Cpu, 
  BarChart3, 
  Settings,
  FileText,
  Server
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navigation = [
    {
      name: "Dashboard",
      tab: "upload",
      icon: <BarChart3 className="h-5 w-5" />,
      current: activeTab === "upload"
    },
    {
      name: "Upload Documents",
      tab: "upload",
      icon: <Upload className="h-5 w-5" />,
      current: activeTab === "upload"
    },
    {
      name: "Document History",
      tab: "history",
      icon: <History className="h-5 w-5" />,
      current: activeTab === "history"
    },
    {
      name: "LLM Configuration",
      tab: "llm",
      icon: <Cpu className="h-5 w-5" />, 
      current: activeTab === "llm"
    },
    {
      name: "API Settings",
      tab: "llm",
      icon: <Server className="h-5 w-5" />, 
      current: activeTab === "llm"
    }
  ];

  return (
    <div className="hidden md:block md:flex-shrink-0 h-screen sticky top-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white shadow-lg h-full">
        <div className="flex items-center h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-white mr-2" />
            <span className="text-lg font-semibold text-white">DocuAI Platform</span>
          </div>
        </div>
        <div className="flex flex-col flex-grow pt-5 bg-gradient-to-b from-white to-blue-50 h-full">
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => onTabChange(item.tab)}
                className={cn(
                  "flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 transform",
                  item.current
                    ? "text-blue-600 bg-white shadow-md translate-x-1"
                    : "text-gray-600 hover:bg-white/80 hover:text-blue-600 hover:translate-x-1"
                )}
              >
                <span className={cn(
                  "flex-shrink-0 mr-3",
                  item.current ? "text-blue-600" : "text-gray-500"
                )}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
          <div className="px-4 py-4 mt-auto border-t border-gray-200/50">
            <div className="flex items-center p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-300 cursor-pointer">
              <div className="flex-shrink-0">
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Settings className="h-4 w-4" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Documentation</p>
                <p className="text-xs text-gray-500">View API docs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
