// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  appliances;
  bills;
  aiTips;
  usageRecords;
  currentId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.appliances = /* @__PURE__ */ new Map();
    this.bills = /* @__PURE__ */ new Map();
    this.aiTips = /* @__PURE__ */ new Map();
    this.usageRecords = /* @__PURE__ */ new Map();
    this.currentId = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByFirebaseUid(firebaseUid) {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid
    );
  }
  async createUser(insertUser) {
    const id = this.currentId++;
    const user = {
      ...insertUser,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  async updateUserEnergyScore(id, score) {
    const user = this.users.get(id);
    if (user) {
      user.energyScore = score;
      this.users.set(id, user);
      return user;
    }
    return void 0;
  }
  async getAppliancesByUserId(userId) {
    return Array.from(this.appliances.values()).filter(
      (appliance) => appliance.userId === userId
    );
  }
  async getAppliance(id) {
    return this.appliances.get(id);
  }
  async createAppliance(insertAppliance) {
    const id = this.currentId++;
    const appliance = {
      ...insertAppliance,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.appliances.set(id, appliance);
    return appliance;
  }
  async updateAppliance(id, updateData) {
    const appliance = this.appliances.get(id);
    if (!appliance) return void 0;
    const updatedAppliance = {
      ...appliance,
      ...updateData
    };
    this.appliances.set(id, updatedAppliance);
    return updatedAppliance;
  }
  async updateAppliance(id, updateData) {
    const appliance = this.appliances.get(id);
    if (appliance) {
      const updated = { ...appliance, ...updateData };
      this.appliances.set(id, updated);
      return updated;
    }
    return void 0;
  }
  async deleteAppliance(id) {
    return this.appliances.delete(id);
  }
  async getBillsByUserId(userId) {
    return Array.from(this.bills.values()).filter(
      (bill) => bill.userId === userId
    );
  }
  async getBill(id) {
    return this.bills.get(id);
  }
  async createBill(insertBill) {
    const id = this.currentId++;
    const bill = {
      ...insertBill,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.bills.set(id, bill);
    return bill;
  }
  async getLatestBillByUserId(userId) {
    const userBills = await this.getBillsByUserId(userId);
    return userBills.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }
  async getTipsByUserId(userId) {
    return Array.from(this.aiTips.values()).filter(
      (tip) => tip.userId === userId
    );
  }
  async createTip(insertTip) {
    const id = this.currentId++;
    const tip = {
      ...insertTip,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.aiTips.set(id, tip);
    return tip;
  }
  async bookmarkTip(id, isBookmarked) {
    const tip = this.aiTips.get(id);
    if (tip) {
      tip.isBookmarked = isBookmarked;
      this.aiTips.set(id, tip);
      return tip;
    }
    return void 0;
  }
  async getUsageRecordsByUserId(userId, startDate, endDate) {
    let records = Array.from(this.usageRecords.values()).filter(
      (record) => record.userId === userId
    );
    if (startDate) {
      records = records.filter((record) => record.date >= startDate);
    }
    if (endDate) {
      records = records.filter((record) => record.date <= endDate);
    }
    return records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  async createUsageRecord(insertRecord) {
    const id = this.currentId++;
    const record = {
      ...insertRecord,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.usageRecords.set(id, record);
    return record;
  }
  async getUsageRecordsByAppliance(applianceId, startDate, endDate) {
    let records = Array.from(this.usageRecords.values()).filter(
      (record) => record.applianceId === applianceId
    );
    if (startDate) {
      records = records.filter((record) => record.date >= startDate);
    }
    if (endDate) {
      records = records.filter((record) => record.date <= endDate);
    }
    return records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  energyScore: integer("energy_score").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var appliances = pgTable("appliances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  specs: text("specs"),
  powerRating: integer("power_rating").notNull(),
  // in watts
  starRating: integer("star_rating").default(1),
  age: integer("age").notNull(),
  // in years
  usageHoursPerDay: real("usage_hours_per_day").default(0),
  usageStartTime: text("usage_start_time"),
  // e.g., "18:00"
  usageEndTime: text("usage_end_time"),
  // e.g., "22:00"
  icon: text("icon").default("fas fa-plug"),
  createdAt: timestamp("created_at").defaultNow()
});
var bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  energySupplier: text("energy_supplier"),
  monthlyBill: real("monthly_bill"),
  currentMonth: text("current_month"),
  unitsConsumed: real("units_consumed"),
  billTotal: real("bill_total"),
  billBreakdown: text("bill_breakdown"),
  // JSON string
  tariffRate: real("tariff_rate"),
  connectionType: text("connection_type"),
  userAddress: text("user_address"),
  areaTariff: text("area_tariff"),
  dueDate: text("due_date"),
  isPaid: boolean("is_paid").default(false),
  customerID: text("customer_id"),
  meterNumber: text("meter_number"),
  sanctionedLoad: text("sanctioned_load"),
  confidence: real("confidence"),
  extractedData: text("extracted_data"),
  // JSON string for full OCR data
  imageUrls: text("image_urls"),
  // JSON array of image URLs
  createdAt: timestamp("created_at").defaultNow()
});
var aiTips = pgTable("ai_tips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  // cooling, timing, home, ghost
  savingsAmount: real("savings_amount"),
  // daily savings in ₹
  difficulty: text("difficulty").default("Easy"),
  // Easy, Medium, Hard
  isBookmarked: boolean("is_bookmarked").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var usageRecords = pgTable("usage_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  applianceId: integer("appliance_id"),
  date: text("date").notNull(),
  // YYYY-MM-DD
  unitsConsumed: real("units_consumed").notNull(),
  cost: real("cost").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertApplianceSchema = createInsertSchema(appliances).omit({
  id: true,
  createdAt: true
});
var insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true
});
var insertAiTipSchema = createInsertSchema(aiTips).omit({
  id: true,
  createdAt: true
});
var insertUsageRecordSchema = createInsertSchema(usageRecords).omit({
  id: true,
  createdAt: true
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
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
          energyScore: 50
        });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/user/:id", async (req, res) => {
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
  app2.put("/api/user/:id/energy-score", async (req, res) => {
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
  app2.get("/api/appliances/user/:userId", async (req, res) => {
    try {
      const appliances2 = await storage.getAppliancesByUserId(parseInt(req.params.userId));
      res.json(appliances2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appliances" });
    }
  });
  app2.post("/api/appliances", async (req, res) => {
    try {
      const validatedData = insertApplianceSchema.parse(req.body);
      const appliance = await storage.createAppliance(validatedData);
      res.json(appliance);
    } catch (error) {
      res.status(400).json({ message: "Invalid appliance data" });
    }
  });
  app2.put("/api/appliances/:id", async (req, res) => {
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
  app2.delete("/api/appliances/:id", async (req, res) => {
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
  app2.get("/api/bills/user/:userId", async (req, res) => {
    try {
      const bills2 = await storage.getBillsByUserId(parseInt(req.params.userId));
      res.json(bills2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });
  app2.post("/api/bills", async (req, res) => {
    try {
      const validatedData = insertBillSchema.parse(req.body);
      const bill = await storage.createBill(validatedData);
      res.json(bill);
    } catch (error) {
      res.status(400).json({ message: "Invalid bill data" });
    }
  });
  app2.get("/api/bills/latest/:userId", async (req, res) => {
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
  app2.get("/api/tips/user/:userId", async (req, res) => {
    try {
      const tips = await storage.getTipsByUserId(parseInt(req.params.userId));
      res.json(tips);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tips" });
    }
  });
  app2.post("/api/tips/generate", async (req, res) => {
    try {
      const { userId, appliances: appliances2, usageData } = req.body;
      const mockTips = [
        {
          title: "Optimize AC Temperature",
          description: "Set your AC to 24-26\xB0C instead of lower temperatures. This can reduce energy consumption by 20-30%.",
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
      const savedTips = [];
      for (const tip of mockTips) {
        const savedTip = await storage.createTip({
          userId,
          title: tip.title,
          description: tip.description,
          category: tip.category,
          savingsAmount: tip.savingsAmount,
          difficulty: tip.difficulty,
          isBookmarked: false
        });
        savedTips.push(savedTip);
      }
      res.json(savedTips);
    } catch (error) {
      console.error("AI tip generation failed:", error);
      res.status(500).json({ message: "Failed to generate AI tips" });
    }
  });
  app2.put("/api/tips/:id/bookmark", async (req, res) => {
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
  app2.get("/api/usage/user/:userId", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const records = await storage.getUsageRecordsByUserId(
        parseInt(req.params.userId),
        startDate,
        endDate
      );
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch usage records" });
    }
  });
  app2.post("/api/usage", async (req, res) => {
    try {
      const record = await storage.createUsageRecord(req.body);
      res.json(record);
    } catch (error) {
      res.status(400).json({ message: "Invalid usage record data" });
    }
  });
  app2.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
      const [appliances2, latestBill, recentUsage, recentTips] = await Promise.all([
        storage.getAppliancesByUserId(userId),
        storage.getLatestBillByUserId(userId),
        storage.getUsageRecordsByUserId(userId, weekAgo, today),
        storage.getTipsByUserId(userId)
      ]);
      const todayUsage = recentUsage.filter((record) => record.date === today).reduce((sum, record) => sum + record.unitsConsumed, 0);
      const todayCost = recentUsage.filter((record) => record.date === today).reduce((sum, record) => sum + record.cost, 0);
      const applianceUsage = /* @__PURE__ */ new Map();
      recentUsage.forEach((record) => {
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
        const topApplianceId = Array.from(applianceUsage.entries()).sort((a, b) => b[1].consumption - a[1].consumption)[0][0];
        const appliance = appliances2.find((a) => a.id === topApplianceId);
        if (appliance) {
          topAppliance = {
            ...appliance,
            ...applianceUsage.get(topApplianceId)
          };
        }
      }
      const latestTip = recentTips.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      res.json({
        todayUsage: Number(todayUsage.toFixed(1)),
        todayCost: Number(todayCost.toFixed(0)),
        topAppliance,
        latestBill,
        latestTip,
        weeklyUsage: recentUsage.map((r) => ({
          date: r.date,
          consumption: r.unitsConsumed,
          cost: r.cost
        }))
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
