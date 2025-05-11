import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  originalName: text("original_name").notNull(),
  size: integer("size").notNull(),
  status: text("status").notNull().default("uploaded"), // uploaded, processing, completed, failed
  progress: integer("progress").notNull().default(0),
  path: text("path").notNull(),
  processingStartedAt: timestamp("processing_started_at"),
  processingCompletedAt: timestamp("processing_completed_at"),
  stage: text("stage"),
  llmUsed: text("llm_used"),
  error: text("error"),
  metadata: json("metadata").$type<DocumentMetadata>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DocumentMetadata = {
  pageCount?: number;
  hasFinancialTables?: boolean;
  isScanned?: boolean;
  extractedData?: Record<string, any>;
};

export const insertDocumentSchema = createInsertSchema(documents).pick({
  name: true,
  originalName: true,
  size: true,
  path: true,
  status: true,
});

export const documentStatusSchema = z.object({
  status: z.enum(["uploaded", "processing", "completed", "failed"]),
  progress: z.number().min(0).max(100).optional(),
  stage: z.string().optional(),
  llmUsed: z.string().optional(),
  error: z.string().optional(),
});

export const llmRoutes = pgTable("llm_routes", {
  id: serial("id").primaryKey(),
  criteria: text("criteria").notNull(),
  llmChoice: text("llm_choice").notNull(),
  description: text("description").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLlmRouteSchema = createInsertSchema(llmRoutes).pick({
  criteria: true,
  llmChoice: true,
  description: true,
  active: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertLlmRoute = z.infer<typeof insertLlmRouteSchema>;
export type LlmRoute = typeof llmRoutes.$inferSelect;

export type DocumentStatus = z.infer<typeof documentStatusSchema>;
