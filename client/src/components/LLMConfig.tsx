import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLlmRoutes, createLlmRoute, updateLlmRoute, deleteLlmRoute } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const LLMConfig: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRouteId, setCurrentRouteId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState({
    criteria: "",
    llm: "",
    rationale: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch LLM routes
  const { data: routesData, isLoading } = useQuery({
    queryKey: ["/api/llm-routes"],
    queryFn: getLlmRoutes
  });
  
  // Create new route mutation
  const createRouteMutation = useMutation({
    mutationFn: createLlmRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/llm-routes"] });
      toast({
        title: "Route created",
        description: "The LLM route was created successfully."
      });
      closeModal();
    },
    onError: (error) => {
      toast({
        title: "Failed to create route",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Update route mutation
  const updateRouteMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number, updates: any }) => updateLlmRoute(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/llm-routes"] });
      toast({
        title: "Route updated",
        description: "The LLM route was updated successfully."
      });
      closeModal();
    },
    onError: (error) => {
      toast({
        title: "Failed to update route",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Delete route mutation
  const deleteRouteMutation = useMutation({
    mutationFn: deleteLlmRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/llm-routes"] });
      toast({
        title: "Route deleted",
        description: "The LLM route was deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete route",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  const openAddModal = () => {
    setFormValues({
      criteria: "",
      llm: "",
      rationale: ""
    });
    setIsEditing(false);
    setCurrentRouteId(null);
    setIsModalOpen(true);
  };
  
  const openEditModal = (route: any) => {
    setFormValues({
      criteria: route.criteria,
      llm: route.llm,
      rationale: route.rationale
    });
    setIsEditing(true);
    setCurrentRouteId(route.id);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formValues.criteria || !formValues.llm || !formValues.rationale) {
      toast({
        title: "Validation error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }
    
    if (isEditing && currentRouteId) {
      updateRouteMutation.mutate({
        id: currentRouteId,
        updates: formValues
      });
    } else {
      createRouteMutation.mutate(formValues);
    }
  };
  
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      deleteRouteMutation.mutate(id);
    }
  };
  
  const routes = routesData || [];

  return (
    <>
      <Card className="mt-8 bg-white rounded-lg shadow">
        <CardHeader className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-medium text-slate-800 flex items-center">
            <span className="material-icons mr-2 text-slate-600">settings</span>
            LLM Routing Configuration
          </h2>
          <Button
            variant="ghost"
            className="text-primary hover:text-primary-800 flex items-center"
            onClick={openAddModal}
          >
            <span className="material-icons mr-1 text-sm">edit</span>
            <span>Edit Configuration</span>
          </Button>
        </CardHeader>
        <CardContent className="p-5">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Document Criteria</th>
                  <th className="px-4 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Selected LLM</th>
                  <th className="px-4 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rationale</th>
                  <th className="px-4 py-3 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-sm text-slate-500">
                      Loading configuration...
                    </td>
                  </tr>
                ) : routes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-sm text-slate-500">
                      No LLM routes configured. Click "Edit Configuration" to add one.
                    </td>
                  </tr>
                ) : (
                  routes.map((route) => (
                    <tr key={route.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-700">{route.criteria}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full
                            ${route.llm === 'Claude 3' ? 'bg-purple-100 text-purple-800' : 
                              route.llm === 'GPT-4' ? 'bg-emerald-100 text-emerald-800' : 
                              'bg-blue-100 text-blue-800'}`}>
                            {route.llm}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-slate-500">{route.rationale}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-slate-500 hover:text-primary mr-2"
                          onClick={() => openEditModal(route)}
                        >
                          <span className="material-icons text-sm">edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-slate-500 hover:text-red-500"
                          onClick={() => handleDelete(route.id)}
                        >
                          <span className="material-icons text-sm">delete</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit/Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit LLM Route" : "Add LLM Route"}</DialogTitle>
            <DialogDescription>
              Configure how documents are routed to different LLMs based on criteria.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="criteria" className="text-right">
                  Criteria
                </Label>
                <Input
                  id="criteria"
                  name="criteria"
                  placeholder="e.g., Length > 10 pages"
                  value={formValues.criteria}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="llm" className="text-right">
                  LLM Model
                </Label>
                <Input
                  id="llm"
                  name="llm"
                  placeholder="e.g., Claude 3, GPT-4, Gemini"
                  value={formValues.llm}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rationale" className="text-right">
                  Rationale
                </Label>
                <Input
                  id="rationale"
                  name="rationale"
                  placeholder="e.g., Superior table detection"
                  value={formValues.rationale}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRouteMutation.isPending || updateRouteMutation.isPending}>
                {createRouteMutation.isPending || updateRouteMutation.isPending ? (
                  <>
                    <span className="material-icons animate-spin mr-2">refresh</span>
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LLMConfig;
