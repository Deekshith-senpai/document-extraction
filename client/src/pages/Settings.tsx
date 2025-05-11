import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LLMConfig from "@/components/LLMConfig";
import DocumentHistory from "@/components/DocumentHistory";
import APISettings from "@/components/APISettings";

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("api-settings");

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
        <p className="text-sm text-slate-500 mt-2 sm:mt-0">
          Configure document processing settings and view processing history
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100">
          <TabsTrigger 
            value="api-settings" 
            className="data-[state=active]:shadow-sm"
          >
            <span className="material-icons mr-2 text-sm">settings</span>
            API Settings
          </TabsTrigger>
          <TabsTrigger 
            value="llm-config" 
            className="data-[state=active]:shadow-sm"
          >
            <span className="material-icons mr-2 text-sm">route</span>
            LLM Routing
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="data-[state=active]:shadow-sm"
          >
            <span className="material-icons mr-2 text-sm">history</span>
            Document History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-settings" className="focus:outline-none">
          <APISettings />
        </TabsContent>
        
        <TabsContent value="llm-config" className="focus:outline-none">
          <LLMConfig />
        </TabsContent>
        
        <TabsContent value="history" className="focus:outline-none">
          <DocumentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;