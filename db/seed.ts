import { db } from "./index";
import * as schema from "@shared/schema";
import { log } from "../server/vite";

async function seed() {
  try {
    // Seed LLM configurations
    const existingConfigs = await db.select().from(schema.llmConfigs);
    
    if (existingConfigs.length === 0) {
      log("Seeding LLM configurations...");
      
      // Insert default LLM routing configurations
      await db.insert(schema.llmConfigs).values([
        {
          condition: "Length > 10 pages",
          llmProvider: "Claude-3-7-sonnet-20250219",
          rationale: "Larger context window",
          isActive: true,
          priority: 3
        },
        {
          condition: "Contains financial tables",
          llmProvider: "GPT-4o",
          rationale: "Superior table detection",
          isActive: true,
          priority: 2
        },
        {
          condition: "Is scanned document",
          llmProvider: "Gemini",
          rationale: "Multimodal capabilities",
          isActive: true,
          priority: 1
        }
      ]);
      
      log("LLM configurations seeded successfully");
    } else {
      log("LLM configurations already exist, skipping seed");
    }
    
    // Initialize system stats if not exist
    const existingStats = await db.select().from(schema.systemStats);
    
    if (existingStats.length === 0) {
      log("Initializing system stats...");
      
      await db.insert(schema.systemStats).values({
        activeDocuments: 0,
        processedToday: 0,
        failedDocuments: 0,
        systemStatus: true,
        lastUpdated: new Date()
      });
      
      log("System stats initialized successfully");
    } else {
      log("System stats already exist, skipping initialization");
    }
    
    log("Seed completed successfully");
  } catch (error) {
    log(`Seed error: ${error instanceof Error ? error.message : String(error)}`);
    console.error(error);
  }
}

seed();
