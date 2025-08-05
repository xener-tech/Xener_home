import {
  users,
  appliances,
  bills,
  aiTips,
  usageRecords,
  type User,
  type InsertUser,
  type Appliance,
  type InsertAppliance,
  type Bill,
  type InsertBill,
  type AiTip,
  type InsertAiTip,
  type UsageRecord,
  type InsertUsageRecord,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserEnergyScore(id: number, score: number): Promise<User | undefined>;

  // Appliances
  getAppliancesByUserId(userId: number): Promise<Appliance[]>;
  getAppliance(id: number): Promise<Appliance | undefined>;
  createAppliance(appliance: InsertAppliance): Promise<Appliance>;
  updateAppliance(id: number, appliance: Partial<InsertAppliance>): Promise<Appliance | undefined>;
  deleteAppliance(id: number): Promise<boolean>;

  // Bills
  getBillsByUserId(userId: number): Promise<Bill[]>;
  getBill(id: number): Promise<Bill | undefined>;
  createBill(bill: InsertBill): Promise<Bill>;
  getLatestBillByUserId(userId: number): Promise<Bill | undefined>;

  // AI Tips
  getTipsByUserId(userId: number): Promise<AiTip[]>;
  createTip(tip: InsertAiTip): Promise<AiTip>;
  bookmarkTip(id: number, isBookmarked: boolean): Promise<AiTip | undefined>;

  // Usage Records
  getUsageRecordsByUserId(userId: number, startDate?: string, endDate?: string): Promise<UsageRecord[]>;
  createUsageRecord(record: InsertUsageRecord): Promise<UsageRecord>;
  getUsageRecordsByAppliance(applianceId: number, startDate?: string, endDate?: string): Promise<UsageRecord[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private appliances: Map<number, Appliance>;
  private bills: Map<number, Bill>;
  private aiTips: Map<number, AiTip>;
  private usageRecords: Map<number, UsageRecord>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.appliances = new Map();
    this.bills = new Map();
    this.aiTips = new Map();
    this.usageRecords = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserEnergyScore(id: number, score: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      user.energyScore = score;
      this.users.set(id, user);
      return user;
    }
    return undefined;
  }

  async getAppliancesByUserId(userId: number): Promise<Appliance[]> {
    return Array.from(this.appliances.values()).filter(
      (appliance) => appliance.userId === userId
    );
  }

  async getAppliance(id: number): Promise<Appliance | undefined> {
    return this.appliances.get(id);
  }

  async createAppliance(insertAppliance: InsertAppliance): Promise<Appliance> {
    const id = this.currentId++;
    const appliance: Appliance = {
      ...insertAppliance,
      id,
      createdAt: new Date(),
    };
    this.appliances.set(id, appliance);
    return appliance;
  }

  async updateAppliance(id: number, updateData: Partial<InsertAppliance>): Promise<Appliance | undefined> {
    const appliance = this.appliances.get(id);
    if (!appliance) return undefined;
    
    const updatedAppliance: Appliance = {
      ...appliance,
      ...updateData,
    };
    this.appliances.set(id, updatedAppliance);
    return updatedAppliance;
  }

  async updateAppliance(id: number, updateData: Partial<InsertAppliance>): Promise<Appliance | undefined> {
    const appliance = this.appliances.get(id);
    if (appliance) {
      const updated = { ...appliance, ...updateData };
      this.appliances.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteAppliance(id: number): Promise<boolean> {
    return this.appliances.delete(id);
  }

  async getBillsByUserId(userId: number): Promise<Bill[]> {
    return Array.from(this.bills.values()).filter(
      (bill) => bill.userId === userId
    );
  }

  async getBill(id: number): Promise<Bill | undefined> {
    return this.bills.get(id);
  }

  async createBill(insertBill: InsertBill): Promise<Bill> {
    const id = this.currentId++;
    const bill: Bill = {
      ...insertBill,
      id,
      createdAt: new Date(),
    };
    this.bills.set(id, bill);
    return bill;
  }

  async getLatestBillByUserId(userId: number): Promise<Bill | undefined> {
    const userBills = await this.getBillsByUserId(userId);
    return userBills.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0];
  }

  async getTipsByUserId(userId: number): Promise<AiTip[]> {
    return Array.from(this.aiTips.values()).filter(
      (tip) => tip.userId === userId
    );
  }

  async createTip(insertTip: InsertAiTip): Promise<AiTip> {
    const id = this.currentId++;
    const tip: AiTip = {
      ...insertTip,
      id,
      createdAt: new Date(),
    };
    this.aiTips.set(id, tip);
    return tip;
  }

  async bookmarkTip(id: number, isBookmarked: boolean): Promise<AiTip | undefined> {
    const tip = this.aiTips.get(id);
    if (tip) {
      tip.isBookmarked = isBookmarked;
      this.aiTips.set(id, tip);
      return tip;
    }
    return undefined;
  }

  async getUsageRecordsByUserId(userId: number, startDate?: string, endDate?: string): Promise<UsageRecord[]> {
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

  async createUsageRecord(insertRecord: InsertUsageRecord): Promise<UsageRecord> {
    const id = this.currentId++;
    const record: UsageRecord = {
      ...insertRecord,
      id,
      createdAt: new Date(),
    };
    this.usageRecords.set(id, record);
    return record;
  }

  async getUsageRecordsByAppliance(applianceId: number, startDate?: string, endDate?: string): Promise<UsageRecord[]> {
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
}

export const storage = new MemStorage();
