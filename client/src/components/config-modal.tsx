import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Trash, Plus } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LLMConfig, CreateLLMConfigRequest } from "@shared/types";

const configSchema = z.object({
  configs: z.array(
    z.object({
      id: z.number().optional(),
      condition: z.string().min(1, "Condition is required"),
      llmProvider: z.string().min(1, "LLM Provider is required"),
      rationale: z.string().min(1, "Rationale is required"),
    })
  ),
});

type ConfigFormValues = z.infer<typeof configSchema>;

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (configs: CreateLLMConfigRequest[]) => void;
  configs: LLMConfig[];
  isLoading: boolean;
}

export function ConfigModal({ isOpen, onClose, onSave, configs, isLoading }: ConfigModalProps) {
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      configs: configs?.length
        ? configs.map((config) => ({
            id: config.id,
            condition: config.condition,
            llmProvider: config.llmProvider,
            rationale: config.rationale,
          }))
        : [{ condition: "", llmProvider: "", rationale: "" }],
    },
  });

  useEffect(() => {
    if (configs?.length && !form.formState.isDirty) {
      form.reset({
        configs: configs.map((config) => ({
          id: config.id,
          condition: config.condition,
          llmProvider: config.llmProvider,
          rationale: config.rationale,
        })),
      });
    }
  }, [configs, form]);

  const addNewRule = () => {
    const currentConfigs = form.getValues().configs;
    form.setValue("configs", [
      ...currentConfigs,
      { condition: "", llmProvider: "", rationale: "" },
    ]);
  };

  const removeRule = (index: number) => {
    const currentConfigs = form.getValues().configs;
    form.setValue(
      "configs",
      currentConfigs.filter((_, i) => i !== index)
    );
  };

  const onSubmit = (values: ConfigFormValues) => {
    onSave(values.configs);
  };

  const conditions = [
    "Length > 10 pages",
    "Contains financial tables",
    "Is scanned document",
    "Contains charts or graphs",
    "Technical document",
    "Legal document",
    "Custom condition...",
  ];

  const llmProviders = [
    "GPT-4o",
    "Claude-3-7-sonnet-20250219",
    "Gemini",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
              <Settings className="text-blue-600 h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg leading-6 font-medium text-gray-900">
                LLM Configuration
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Configure the routing rules for different document types.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {form.watch("configs").map((_, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Rule {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRule(index)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-500"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <FormField
                    control={form.control}
                    name={`configs.${index}.condition`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-gray-700">Condition</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            if (value === "Custom condition...") {
                              form.setValue(`configs.${index}.condition`, "");
                            } else {
                              field.onChange(value);
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {conditions.map((condition) => (
                              <SelectItem key={condition} value={condition}>
                                {condition}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {field.value === "" && (
                          <Input
                            className="mt-2"
                            placeholder="Enter custom condition"
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`configs.${index}.llmProvider`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-gray-700">Route to LLM</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an LLM" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {llmProviders.map((provider) => (
                              <SelectItem key={provider} value={provider}>
                                {provider}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`configs.${index}.rationale`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-gray-700">Rationale</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={addNewRule}
            >
              <Plus className="h-4 w-4" />
              Add New Rule
            </Button>

            <DialogFooter className="sm:flex sm:flex-row-reverse gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Configuration"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
