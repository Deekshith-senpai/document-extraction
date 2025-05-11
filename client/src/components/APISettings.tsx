import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// Note: In a real application, you would fetch and update these settings via API
// For now, we'll use a mock implementation that shows the UI

const APISettings: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    openaiEnabled: false,
    anthropicEnabled: false,
    perplexityEnabled: false,
    useAutoRouting: true,
    batchSize: 5,
    processingTimeout: 180,
    apiKeys: {
      openai: "",
      anthropic: "",
      perplexity: ""
    }
  });

  // Simulate loading settings
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if the API keys exist
      const checkApiKeys = async () => {
        try {
          // In a real implementation, you would fetch from the server
          // This is a mockup to show the UI state
          setSettings({
            ...settings,
            openaiEnabled: true,
            anthropicEnabled: true,
            perplexityEnabled: false,
            apiKeys: {
              ...settings.apiKeys,
              openai: "••••••••••••••••••••••••••••••",
              anthropic: "••••••••••••••••••••••••••••••",
              perplexity: ""
            }
          });
          setIsLoading(false);
        } catch (error) {
          console.error("Error checking API keys:", error);
          setIsLoading(false);
        }
      };
      
      checkApiKeys();
    }, 1000);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleChange = (key: string, value: boolean) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "batchSize" || name === "processingTimeout") {
      setSettings({
        ...settings,
        [name]: parseInt(value) || 0
      });
    } else if (name.startsWith("apiKeys.")) {
      const keyName = name.split(".")[1];
      setSettings({
        ...settings,
        apiKeys: {
          ...settings.apiKeys,
          [keyName]: value
        }
      });
    }
  };

  const handleSaveSettings = () => {
    setIsLoading(true);
    
    // Simulate saving to the server
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Settings saved",
        description: "Your API settings have been updated successfully."
      });
    }, 1000);
  };

  const handleSaveAPIKey = (provider: string) => {
    const key = settings.apiKeys[provider as keyof typeof settings.apiKeys];
    
    if (!key && provider !== 'perplexity') {
      toast({
        title: "API Key Required",
        description: `Please enter a valid API key for ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`,
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate saving the API key
    setTimeout(() => {
      setIsLoading(false);
      
      // Update the UI to show masked API key
      if (key) {
        setSettings({
          ...settings,
          apiKeys: {
            ...settings.apiKeys,
            [provider]: "••••••••••••••••••••••••••••••"
          },
          [`${provider}Enabled`]: true
        });
      }
      
      toast({
        title: "API Key Updated",
        description: `Your ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key has been saved successfully.`
      });
    }, 1000);
  };

  return (
    <Card className="bg-white rounded-lg shadow mt-8">
      <CardHeader className="px-5 py-4 border-b border-slate-200">
        <h2 className="font-medium text-slate-800 flex items-center">
          <span className="material-icons mr-2 text-slate-600">settings</span>
          API Settings
        </h2>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <span className="material-icons animate-spin mr-2">refresh</span>
            <span>Loading settings...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4 border-b border-slate-200 pb-4">
              <h3 className="text-lg font-medium">API Providers</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* OpenAI Settings */}
                <div className="border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                        <span className="material-icons text-slate-500">chat</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">OpenAI</h4>
                        <p className="text-xs text-slate-500">GPT-4 Model</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.openaiEnabled} 
                      onCheckedChange={(checked) => handleToggleChange("openaiEnabled", checked)}
                      disabled={!settings.apiKeys.openai}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="apiKeys.openai">API Key</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="apiKeys.openai"
                        name="apiKeys.openai"
                        value={settings.apiKeys.openai}
                        onChange={handleInputChange}
                        type="password"
                        placeholder="Enter OpenAI API key"
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => handleSaveAPIKey("openai")}
                        size="sm"
                      >
                        Save
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Required for financial documents with tables.
                    </p>
                  </div>
                </div>
                
                {/* Anthropic Settings */}
                <div className="border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                        <span className="material-icons text-slate-500">psychology</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Anthropic</h4>
                        <p className="text-xs text-slate-500">Claude 3 Model</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.anthropicEnabled} 
                      onCheckedChange={(checked) => handleToggleChange("anthropicEnabled", checked)}
                      disabled={!settings.apiKeys.anthropic}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="apiKeys.anthropic">API Key</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="apiKeys.anthropic"
                        name="apiKeys.anthropic"
                        value={settings.apiKeys.anthropic}
                        onChange={handleInputChange}
                        type="password"
                        placeholder="Enter Anthropic API key"
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => handleSaveAPIKey("anthropic")}
                        size="sm"
                      >
                        Save
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Recommended for longer documents (10+ pages).
                    </p>
                  </div>
                </div>
                
                {/* Perplexity Settings */}
                <div className="border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                        <span className="material-icons text-slate-500">bolt</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Perplexity</h4>
                        <p className="text-xs text-slate-500">Sonar Model</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.perplexityEnabled} 
                      onCheckedChange={(checked) => handleToggleChange("perplexityEnabled", checked)}
                      disabled={!settings.apiKeys.perplexity}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="apiKeys.perplexity">API Key</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="apiKeys.perplexity"
                        name="apiKeys.perplexity"
                        value={settings.apiKeys.perplexity}
                        onChange={handleInputChange}
                        type="password"
                        placeholder="Enter Perplexity API key"
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => handleSaveAPIKey("perplexity")}
                        size="sm"
                      >
                        Save
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Optional: For improved search capabilities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 border-b border-slate-200 pb-4">
              <h3 className="text-lg font-medium">Processing Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Auto-routing</h4>
                    <p className="text-xs text-slate-500">
                      Automatically select the best LLM based on document characteristics
                    </p>
                  </div>
                  <Switch 
                    checked={settings.useAutoRouting} 
                    onCheckedChange={(checked) => handleToggleChange("useAutoRouting", checked)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batchSize">Batch Size</Label>
                    <Input 
                      id="batchSize"
                      name="batchSize"
                      type="number"
                      value={settings.batchSize}
                      onChange={handleInputChange}
                      min={1}
                      max={10}
                    />
                    <p className="text-xs text-slate-500">
                      Maximum number of documents to process simultaneously
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="processingTimeout">Processing Timeout (seconds)</Label>
                    <Input 
                      id="processingTimeout"
                      name="processingTimeout"
                      type="number"
                      value={settings.processingTimeout}
                      onChange={handleInputChange}
                      min={60}
                      max={600}
                    />
                    <p className="text-xs text-slate-500">
                      Maximum time allowed for document processing
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {!settings.openaiEnabled || !settings.anthropicEnabled ? (
              <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                <span className="material-icons mr-2">warning</span>
                <AlertDescription>
                  Some LLM providers are not enabled. Document processing capabilities may be limited.
                </AlertDescription>
              </Alert>
            ) : null}
            
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="material-icons animate-spin mr-2">refresh</span>
                    Saving...
                  </>
                ) : "Save Settings"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default APISettings;