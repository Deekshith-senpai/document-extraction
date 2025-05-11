import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { documentProcessor } from "./services/documentProcessor";
import { saveFile, validatePdfFile } from "./utils/fileHelpers";
import { initializeWebsocket, getWebsocketHandler } from "./websocket";
import { documentStatusSchema, insertDocumentSchema, insertLlmRouteSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize WebSocket handler
  initializeWebsocket(httpServer);

  // API routes
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json({ documents });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/active", async (req, res) => {
    try {
      const documents = await storage.getActiveDocuments();
      res.json({ documents });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active documents" });
    }
  });

  app.get("/api/documents/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const documents = await storage.getRecentDocuments(limit);
      res.json({ documents });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json({ document });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // Upload a new document
  app.post(
    "/api/documents/upload",
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        const file = req.file;
        if (!file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        // Validate file
        const validation = validatePdfFile(file);
        if (!validation.valid) {
          return res.status(400).json({ message: validation.error });
        }

        // Save file to disk
        const savedFile = await saveFile(file.buffer, file.originalname);

        // Create document record
        const newDocument = await storage.createDocument({
          name: savedFile.name,
          originalName: file.originalname,
          size: file.size,
          path: savedFile.path,
          status: "uploaded",
        });

        res.status(201).json({ document: newDocument });
      } catch (error) {
        console.error("Error uploading document:", error);
        res.status(500).json({
          message: error instanceof Error ? error.message : "Failed to upload document",
        });
      }
    }
  );

  // Start processing a document
  app.post("/api/documents/:id/process", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      await documentProcessor.startProcessing(id);
      
      // Notify WebSocket clients about the state change
      const websocketHandler = getWebsocketHandler();
      if (websocketHandler) {
        await websocketHandler.notifyDocumentStateChange(id);
      }

      res.json({ message: "Document processing started" });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to start processing",
      });
    }
  });

  // Stop processing a document
  app.post("/api/documents/:id/stop", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      await documentProcessor.stopProcessing(id);
      
      // Notify WebSocket clients
      const websocketHandler = getWebsocketHandler();
      if (websocketHandler) {
        await websocketHandler.notifyDocumentStateChange(id);
      }

      res.json({ message: "Document processing stopped" });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to stop processing",
      });
    }
  });

  // Update document status
  app.patch("/api/documents/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      // Validate request body
      const validatedData = documentStatusSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid status data" });
      }

      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const updatedDocument = await storage.updateDocument(id, validatedData.data);
      
      // Notify WebSocket clients
      const websocketHandler = getWebsocketHandler();
      if (websocketHandler) {
        await websocketHandler.notifyDocumentStateChange(id);
      }

      res.json({ document: updatedDocument });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to update document status",
      });
    }
  });

  // Get LLM routes configuration
  app.get("/api/llm-routes", async (req, res) => {
    try {
      const routes = await storage.getLlmRoutes();
      res.json({ routes });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch LLM routes" });
    }
  });

  // Create a new LLM route
  app.post("/api/llm-routes", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertLlmRouteSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid LLM route data" });
      }

      const newRoute = await storage.createLlmRoute(validatedData.data);
      res.status(201).json({ route: newRoute });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to create LLM route",
      });
    }
  });

  // Update an LLM route
  app.patch("/api/llm-routes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid route ID" });
      }

      // Validate request body (allow partial updates)
      const validatedData = insertLlmRouteSchema.partial().safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid route data" });
      }

      const route = await storage.getLlmRoutes();
      const existingRoute = route.find(r => r.id === id);
      if (!existingRoute) {
        return res.status(404).json({ message: "LLM route not found" });
      }

      const updatedRoute = await storage.updateLlmRoute(id, validatedData.data);
      res.json({ route: updatedRoute });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to update LLM route",
      });
    }
  });

  // Delete an LLM route
  app.delete("/api/llm-routes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid route ID" });
      }

      const success = await storage.deleteLlmRoute(id);
      if (!success) {
        return res.status(404).json({ message: "LLM route not found" });
      }

      res.json({ message: "LLM route deleted successfully" });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to delete LLM route",
      });
    }
  });

  // Get system stats
  app.get("/api/stats", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      
      const stats = {
        active: documents.filter(doc => doc.status === 'processing').length,
        processed: documents.filter(doc => doc.status === 'completed' && 
                                    doc.processingCompletedAt && 
                                    new Date(doc.processingCompletedAt).toDateString() === new Date().toDateString()).length,
        failed: documents.filter(doc => doc.status === 'failed').length,
        total: documents.length
      };
      
      res.json({ stats });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system stats" });
    }
  });

  return httpServer;
}
