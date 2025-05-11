import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  documents,
  llmRoutes,
  type User,
  type InsertUser,
  type Document,
  type InsertDocument,
  type LlmRoute,
  type InsertLlmRoute,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document operations
  getDocuments(): Promise<Document[]>;
  getActiveDocuments(): Promise<Document[]>;
  getRecentDocuments(limit: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // LLM Route operations
  getLlmRoutes(): Promise<LlmRoute[]>;
  createLlmRoute(route: InsertLlmRoute): Promise<LlmRoute>;
  updateLlmRoute(id: number, updates: Partial<LlmRoute>): Promise<LlmRoute | undefined>;
  deleteLlmRoute(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getDocuments(): Promise<Document[]> {
    return db.select().from(documents).orderBy(documents.createdAt);
  }

  async getActiveDocuments(): Promise<Document[]> {
    return db.select()
      .from(documents)
      .where(eq(documents.status, 'processing'))
      .orderBy(documents.processingStartedAt);
  }

  async getRecentDocuments(limit: number): Promise<Document[]> {
    return db.select()
      .from(documents)
      .where(eq(documents.status, 'completed'))
      .orderBy(documents.processingCompletedAt, 'desc')
      .limit(limit);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const deleted = await db
      .delete(documents)
      .where(eq(documents.id, id));
    return true;
  }

  async getLlmRoutes(): Promise<LlmRoute[]> {
    return db.select().from(llmRoutes).orderBy(llmRoutes.id);
  }

  async createLlmRoute(insertRoute: InsertLlmRoute): Promise<LlmRoute> {
    const [route] = await db
      .insert(llmRoutes)
      .values(insertRoute)
      .returning();
    return route;
  }

  async updateLlmRoute(id: number, updates: Partial<LlmRoute>): Promise<LlmRoute | undefined> {
    const [updatedRoute] = await db
      .update(llmRoutes)
      .set(updates)
      .where(eq(llmRoutes.id, id))
      .returning();
    return updatedRoute || undefined;
  }

  async deleteLlmRoute(id: number): Promise<boolean> {
    await db
      .delete(llmRoutes)
      .where(eq(llmRoutes.id, id));
    return true;
  }
}

// No need to initialize the database as we've already done it manually

export const storage = new DatabaseStorage();