import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  energyScore: integer("energy_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appliances = pgTable("appliances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  specs: text("specs"),
  powerRating: integer("power_rating").notNull(), // in watts
  starRating: integer("star_rating").default(1),
  age: integer("age").notNull(), // in years
  usageHoursPerDay: real("usage_hours_per_day").default(0),
  usageStartTime: text("usage_start_time"), // e.g., "18:00"
  usageEndTime: text("usage_end_time"), // e.g., "22:00"
  icon: text("icon").default("fas fa-plug"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  energySupplier: text("energy_supplier"),
  monthlyBill: real("monthly_bill"),
  currentMonth: text("current_month"),
  unitsConsumed: real("units_consumed"),
  billTotal: real("bill_total"),
  billBreakdown: text("bill_breakdown"), // JSON string
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
  extractedData: text("extracted_data"), // JSON string for full OCR data
  imageUrls: text("image_urls"), // JSON array of image URLs
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiTips = pgTable("ai_tips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // cooling, timing, home, ghost
  savingsAmount: real("savings_amount"), // daily savings in ₹
  difficulty: text("difficulty").default("Easy"), // Easy, Medium, Hard
  isBookmarked: boolean("is_bookmarked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usageRecords = pgTable("usage_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  applianceId: integer("appliance_id"),
  date: text("date").notNull(), // YYYY-MM-DD
  unitsConsumed: real("units_consumed").notNull(),
  cost: real("cost").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertApplianceSchema = createInsertSchema(appliances).omit({
  id: true,
  createdAt: true,
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
});

export const insertAiTipSchema = createInsertSchema(aiTips).omit({
  id: true,
  createdAt: true,
});

export const insertUsageRecordSchema = createInsertSchema(usageRecords).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Appliance = typeof appliances.$inferSelect;
export type InsertAppliance = z.infer<typeof insertApplianceSchema>;
export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type AiTip = typeof aiTips.$inferSelect;
export type InsertAiTip = z.infer<typeof insertAiTipSchema>;
export type UsageRecord = typeof usageRecords.$inferSelect;
export type InsertUsageRecord = z.infer<typeof insertUsageRecordSchema>;
