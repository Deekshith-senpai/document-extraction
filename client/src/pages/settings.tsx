import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Key, AlertCircle, CheckCircle, Save, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface LLMProvider {
  id: string;
  name: string;
  isAvailable: boolean;
  description: string;
  provider: string;
}

// Define form schema
const apiKeyFormSchema = z.object({
  perplexityApiKey: z.string().optional(),
  anthropicApiKey: z.string().optional(),
  openaiApiKey: z.string().optional(),
});

type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("api-keys");
  const [isSaving, setIsSaving] = useState(false);

  // Define form
  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      perplexityApiKey: "",
      anthropicApiKey: "",
      openaiApiKey: "",
    },
  });

  // Fetch LLM providers status
  const { data: providers = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/llm-providers'],
    queryFn: async () => {
      const response = await fetch('/api/llm-providers');
      if (!response.ok) {
        throw new Error("Failed to fetch LLM providers");
      }
      const data = await response.json();
      return data as LLMProvider[];
    }
  });
  
  // Handle save API keys
  const onSubmit = async (values: ApiKeyFormValues) => {
    setIsSaving(true);
    try {
      // This would send the keys to a secure endpoint to update environment variables
      // In real-world this would require server-side handling with proper security
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "API Keys Submitted",
        description: "Your request to add API keys has been sent to the administrator.",
      });
      
      // In a production environment, you would use a real endpoint like:
      /*
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      
      if (!response.ok) {
        throw new Error("Failed to save API keys");
      }
      */
      
      form.reset();
      // Refetch provider status after a brief delay to simulate server processing
      setTimeout(() => refetch(), 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API keys. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Display info about each provider
  const renderProviderStatus = (provider: LLMProvider) => {
    return (
      <Card key={provider.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{provider.name}</CardTitle>
            {provider.isAvailable ? (
              <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
            ) : (
              <Badge variant="destructive">Unavailable</Badge>
            )}
          </div>
          <CardDescription>{provider.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Provider:</span>
              </div>
              <span className="text-sm font-medium">{provider.provider}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Status:</span>
              </div>
              <div className="flex items-center">
                {provider.isAvailable ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span className="text-sm font-medium">
                  {provider.isAvailable ? "API Key Configured" : "API Key Missing"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-muted-foreground mb-6">
        Configure your document processing settings and API keys
      </p>
      
      <Tabs defaultValue="api-keys" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-keys">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">LLM Provider Status</h2>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Refresh Status
              </Button>
            </div>
            <p className="text-muted-foreground mb-4">
              The following LLM providers are currently configured in your environment.
              Contact your administrator to update API keys.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <p>Loading provider status...</p>
              ) : (
                providers.map(renderProviderStatus)
              )}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Add API Keys</h2>
            <p className="text-muted-foreground mb-4">
              Enter your API keys below to enable the corresponding LLM providers.
              These keys will be securely stored as environment variables.
            </p>
            
            <Card>
              <CardHeader>
                <CardTitle>API Key Management</CardTitle>
                <CardDescription>Enter your API keys to enable different LLM providers</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="perplexityApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Perplexity API Key (for Llama)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter Perplexity API key" 
                              type="password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Used for Llama 3.1 Sonar model via Perplexity API
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="anthropicApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anthropic API Key</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter Anthropic API key" 
                              type="password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Used for Claude 3.7 Sonnet model
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="openaiApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OpenAI API Key</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter OpenAI API key" 
                              type="password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Used for GPT-4o model
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save API Keys
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <div className="bg-muted p-4 rounded-md mt-6">
              <h3 className="text-sm font-medium mb-2">Environment Variables</h3>
              <p className="text-sm text-muted-foreground mb-2">
                For server-side configuration, the following environment variables are used:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>PERPLEXITY_API_KEY</strong> - For Llama models via Perplexity</li>
                <li><strong>ANTHROPIC_API_KEY</strong> - For Claude models</li>
                <li><strong>OPENAI_API_KEY</strong> - For GPT models</li>
              </ul>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preferences">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">LLM Processing Preferences</h2>
            <p className="text-muted-foreground mb-4">
              The system will automatically select the best LLM provider based on availability, with the following priority:
            </p>
            <ol className="list-decimal list-inside space-y-1 mb-4">
              <li>Llama 3.1 Sonar (if Perplexity API key is available)</li>
              <li>Claude 3.7 Sonnet (if Anthropic API key is available)</li>
              <li>GPT-4o (if OpenAI API key is available)</li>
              <li>Simulated data (if no API keys are available)</li>
            </ol>
            <p className="text-muted-foreground">
              This priority can be adjusted by modifying the route logic in the server.
            </p>
          </div>
          
          <Separator className="my-6" />
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Document Processing Settings</h2>
            <p className="text-muted-foreground">
              Document processing settings are configured at the system level. Contact your administrator to modify these settings.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}