import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertApplianceSchema, insertBillSchema, insertAiTipSchema } from "@shared/schema";
import OpenAI from "openai";

// const openai = new OpenAI({ 
//   apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY 
// });

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { firebaseUid, email, name } = req.body;
      
      if (!firebaseUid || !email || !name) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      let user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        user = await storage.createUser({
          firebaseUid,
          email,
          name,
          energyScore: 50,
        });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/user/:id/energy-score", async (req, res) => {
    try {
      const { score } = req.body;
      const user = await storage.updateUserEnergyScore(parseInt(req.params.id), score);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update energy score" });
    }
  });

  // Appliance routes
  app.get("/api/appliances/user/:userId", async (req, res) => {
    try {
      const appliances = await storage.getAppliancesByUserId(parseInt(req.params.userId));
      res.json(appliances);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appliances" });
    }
  });

  app.post("/api/appliances", async (req, res) => {
    try {
      const validatedData = insertApplianceSchema.parse(req.body);
      const appliance = await storage.createAppliance(validatedData);
      res.json(appliance);
    } catch (error) {
      res.status(400).json({ message: "Invalid appliance data" });
    }
  });

  app.put("/api/appliances/:id", async (req, res) => {
    try {
      const appliance = await storage.updateAppliance(parseInt(req.params.id), req.body);
      if (!appliance) {
        return res.status(404).json({ message: "Appliance not found" });
      }
      res.json(appliance);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appliance" });
    }
  });

  app.delete("/api/appliances/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAppliance(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ message: "Appliance not found" });
      }
      res.json({ message: "Appliance deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appliance" });
    }
  });

  // Bill routes
  app.get("/api/bills/user/:userId", async (req, res) => {
    try {
      const bills = await storage.getBillsByUserId(parseInt(req.params.userId));
      res.json(bills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  app.post("/api/bills", async (req, res) => {
    try {
      const validatedData = insertBillSchema.parse(req.body);
      const bill = await storage.createBill(validatedData);
      res.json(bill);
    } catch (error) {
      res.status(400).json({ message: "Invalid bill data" });
    }
  });

  app.get("/api/bills/latest/:userId", async (req, res) => {
    try {
      const bill = await storage.getLatestBillByUserId(parseInt(req.params.userId));
      if (!bill) {
        return res.status(404).json({ message: "No bills found" });
      }
      res.json(bill);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch latest bill" });
    }
  });

  // AI Tips routes
  app.get("/api/tips/user/:userId", async (req, res) => {
    try {
      const tips = await storage.getTipsByUserId(parseInt(req.params.userId));
      res.json(tips);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tips" });
    }
  });

  app.post("/api/tips/generate", async (req, res) => {
    try {
      const { userId, appliances, usageData } = req.body;

      // Temporarily return mock tips when OpenAI is not configured
      // TODO: Uncomment when API keys are added
      // if (!openai.apiKey) {
      //   return res.status(500).json({ message: "OpenAI API key not configured" });
      // }

      // Mock tips for demonstration (remove when OpenAI is enabled)
      const mockTips = [
        {
          title: "Optimize AC Temperature",
          description: "Set your AC to 24-26°C instead of lower temperatures. This can reduce energy consumption by 20-30%.",
          category: "cooling",
          savingsAmount: 50,
          difficulty: "Easy"
        },
        {
          title: "Use Off-Peak Hours",
          description: "Run heavy appliances like washing machine during off-peak hours (11 PM - 6 AM) to save on electricity tariff.",
          category: "timing",
          savingsAmount: 30,
          difficulty: "Medium"
        },
        {
          title: "Unplug Standby Devices",
          description: "Unplug electronics when not in use to eliminate phantom power consumption.",
          category: "ghost",
          savingsAmount: 15,
          difficulty: "Easy"
        }
      ];

      // Save mock tips to storage
      const savedTips = [];
      for (const tip of mockTips) {
        const savedTip = await storage.createTip({
          userId,
          title: tip.title,
          description: tip.description,
          category: tip.category,
          savingsAmount: tip.savingsAmount,
          difficulty: tip.difficulty,
          isBookmarked: false,
        });
        savedTips.push(savedTip);
      }

      res.json(savedTips);

      /* TODO: Uncomment when OpenAI API key is configured
      const prompt = `Based on the following appliance and usage data, generate 3 personalized energy-saving tips:

Appliances: ${JSON.stringify(appliances)}
Usage Data: ${JSON.stringify(usageData)}

Please provide tips in JSON format with the following structure:
{
  "tips": [
    {
      "title": "Tip title",
      "description": "Detailed description",
      "category": "cooling|timing|home|ghost",
      "savingsAmount": number (daily savings in ₹),
      "difficulty": "Easy|Medium|Hard"
    }
  ]
}`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert energy efficiency consultant. Generate practical, actionable energy-saving tips based on Indian electricity usage patterns and costs."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || '{"tips": []}');
      
      // Save generated tips to storage
      const savedTips = [];
      for (const tip of aiResponse.tips) {
        const savedTip = await storage.createTip({
          userId,
          title: tip.title,
          description: tip.description,
          category: tip.category,
          savingsAmount: tip.savingsAmount,
          difficulty: tip.difficulty,
          isBookmarked: false,
        });
        savedTips.push(savedTip);
      }

      res.json(savedTips);
      */
    } catch (error) {
      console.error("AI tip generation failed:", error);
      res.status(500).json({ message: "Failed to generate AI tips" });
    }
  });

  app.put("/api/tips/:id/bookmark", async (req, res) => {
    try {
      const { isBookmarked } = req.body;
      const tip = await storage.bookmarkTip(parseInt(req.params.id), isBookmarked);
      if (!tip) {
        return res.status(404).json({ message: "Tip not found" });
      }
      res.json(tip);
    } catch (error) {
      res.status(500).json({ message: "Failed to bookmark tip" });
    }
  });

  // Usage Records routes
  app.get("/api/usage/user/:userId", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const records = await storage.getUsageRecordsByUserId(
        parseInt(req.params.userId),
        startDate as string,
        endDate as string
      );
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch usage records" });
    }
  });

  app.post("/api/usage", async (req, res) => {
    try {
      const record = await storage.createUsageRecord(req.body);
      res.json(record);
    } catch (error) {
      res.status(400).json({ message: "Invalid usage record data" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [appliances, latestBill, recentUsage, recentTips] = await Promise.all([
        storage.getAppliancesByUserId(userId),
        storage.getLatestBillByUserId(userId),
        storage.getUsageRecordsByUserId(userId, weekAgo, today),
        storage.getTipsByUserId(userId)
      ]);

      // Calculate today's usage and cost
      const todayUsage = recentUsage
        .filter(record => record.date === today)
        .reduce((sum, record) => sum + record.unitsConsumed, 0);

      const todayCost = recentUsage
        .filter(record => record.date === today)
        .reduce((sum, record) => sum + record.cost, 0);

      // Find top consuming appliance
      const applianceUsage = new Map();
      recentUsage.forEach(record => {
        if (record.applianceId) {
          const current = applianceUsage.get(record.applianceId) || { consumption: 0, cost: 0 };
          applianceUsage.set(record.applianceId, {
            consumption: current.consumption + record.unitsConsumed,
            cost: current.cost + record.cost
          });
        }
      });

      let topAppliance = null;
      if (applianceUsage.size > 0) {
        const topApplianceId = Array.from(applianceUsage.entries())
          .sort((a, b) => b[1].consumption - a[1].consumption)[0][0];
        const appliance = appliances.find(a => a.id === topApplianceId);
        if (appliance) {
          topAppliance = {
            ...appliance,
            ...applianceUsage.get(topApplianceId)
          };
        }
      }

      // Get latest tip
      const latestTip = recentTips.sort((a, b) => 
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      )[0];

      res.json({
        todayUsage: Number(todayUsage.toFixed(1)),
        todayCost: Number(todayCost.toFixed(0)),
        topAppliance,
        latestBill,
        latestTip,
        weeklyUsage: recentUsage.map(r => ({
          date: r.date,
          consumption: r.unitsConsumed,
          cost: r.cost
        }))
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
