import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { DocumentStatus } from "./types";

// Users table (retained from original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  pageCount: integer("page_count"),
  status: text("status").$type<DocumentStatus>().notNull().default("IN_PROGRESS"),
  progress: integer("progress").default(0), // Percentage 0-100
  currentStep: text("current_step"),
  stepProgress: text("step_progress"),
  error: text("error"),
  errorDetails: jsonb("error_details"),
  llmProvider: text("llm_provider"),
  extractedContent: jsonb("extracted_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  userId: integer("user_id").references(() => users.id),
});

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id]
  })
}));

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

// LLM Configuration table
export const llmConfigs = pgTable("llm_configs", {
  id: serial("id").primaryKey(),
  condition: text("condition").notNull(),
  llmProvider: text("llm_provider").notNull(),
  rationale: text("rationale").notNull(),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLLMConfigSchema = createInsertSchema(llmConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Stats table for dashboard
export const systemStats = pgTable("system_stats", {
  id: serial("id").primaryKey(),
  activeDocuments: integer("active_documents").default(0),
  processedToday: integer("processed_today").default(0),
  failedDocuments: integer("failed_documents").default(0),
  systemStatus: boolean("system_status").default(true),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertSystemStatsSchema = createInsertSchema(systemStats).omit({
  id: true,
  lastUpdated: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertLLMConfig = z.infer<typeof insertLLMConfigSchema>;
export type LLMConfig = typeof llmConfigs.$inferSelect;

export type InsertSystemStats = z.infer<typeof insertSystemStatsSchema>;
export type SystemStats = typeof systemStats.$inferSelect;
