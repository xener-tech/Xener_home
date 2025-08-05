// Client-side OpenAI utilities for Xener Home
// Note: For security, actual OpenAI calls should be made from the backend
// This file provides types and client-side utilities

export interface EnergyTipRequest {
  appliances: Array<{
    name: string;
    type: string;
    powerRating: number;
    usageHoursPerDay: number;
    age: number;
  }>;
  usageData: Array<{
    date: string;
    unitsConsumed: number;
    cost: number;
  }>;
  userPreferences?: {
    prioritizeSavings?: boolean;
    difficultyLevel?: 'Easy' | 'Medium' | 'Hard';
    categories?: string[];
  };
}

export interface GeneratedTip {
  title: string;
  description: string;
  category: 'cooling' | 'timing' | 'home' | 'ghost';
  savingsAmount: number; // daily savings in ₹
  difficulty: 'Easy' | 'Medium' | 'Hard';
  implementationSteps?: string[];
  estimatedROI?: number; // return on investment in months
}

export interface BillAnalysisRequest {
  billData: {
    unitsConsumed: number;
    totalAmount: number;
    billPeriod: string;
    tariffRate?: number;
  };
  historicalData?: Array<{
    period: string;
    units: number;
    cost: number;
  }>;
}

export interface BillAnalysisResponse {
  insights: string[];
  predictions: {
    nextMonthUnits: number;
    nextMonthCost: number;
    yearlyProjection: number;
  };
  recommendations: string[];
  efficiency: {
    score: number; // 0-100
    comparison: string; // compared to similar households
    improvements: string[];
  };
}

export interface ApplianceOptimizationRequest {
  appliance: {
    name: string;
    type: string;
    powerRating: number;
    starRating: number;
    age: number;
    currentUsage: number; // hours per day
    usagePattern: string; // time of day
  };
  electricityTariff: {
    peakRate: number;
    offPeakRate: number;
    peakHours: string;
  };
}

export interface ApplianceOptimizationResponse {
  currentCost: {
    daily: number;
    monthly: number;
    yearly: number;
  };
  optimizedUsage: {
    recommendedHours: number;
    recommendedTiming: string;
    potentialSavings: {
      daily: number;
      monthly: number;
      yearly: number;
    };
  };
  recommendations: string[];
  replacementSuggestion?: {
    suggestedModel: string;
    estimatedSavings: number;
    paybackPeriod: number; // in months
  };
}

// Client-side utility functions
export class EnergyAI {
  private static readonly API_BASE = '/api';

  /**
   * Generate personalized energy-saving tips
   */
  static async generateTips(request: EnergyTipRequest): Promise<GeneratedTip[]> {
    try {
      const response = await fetch(`${this.API_BASE}/tips/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to generate tips: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating AI tips:', error);
      throw new Error('Unable to generate personalized tips. Please try again later.');
    }
  }

  /**
   * Analyze electricity bill and provide insights
   */
  static async analyzeBill(request: BillAnalysisRequest): Promise<BillAnalysisResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/analysis/bill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze bill: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing bill:', error);
      throw new Error('Unable to analyze bill data. Please try again later.');
    }
  }

  /**
   * Get appliance-specific optimization recommendations
   */
  static async optimizeAppliance(request: ApplianceOptimizationRequest): Promise<ApplianceOptimizationResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/optimization/appliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to optimize appliance: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error optimizing appliance:', error);
      throw new Error('Unable to optimize appliance usage. Please try again later.');
    }
  }

  /**
   * Calculate energy efficiency score based on usage patterns
   */
  static calculateEfficiencyScore(usageData: Array<{ date: string; unitsConsumed: number; cost: number }>): number {
    if (!usageData || usageData.length === 0) return 50; // Default score

    // Calculate average daily consumption
    const totalConsumption = usageData.reduce((sum, record) => sum + record.unitsConsumed, 0);
    const avgDailyConsumption = totalConsumption / usageData.length;

    // Indian household average is ~4-5 kWh per day
    const indianAverage = 4.5;
    
    // Score based on consumption relative to average
    let score = 100 - Math.max(0, (avgDailyConsumption - indianAverage) / indianAverage * 50);
    
    // Factor in consistency (lower variance = higher score)
    const variance = usageData.reduce((sum, record) => {
      const diff = record.unitsConsumed - avgDailyConsumption;
      return sum + diff * diff;
    }, 0) / usageData.length;
    
    const consistencyBonus = Math.max(0, 10 - variance);
    score += consistencyBonus;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generate simple tips based on client-side analysis
   */
  static generateSimpleTips(appliances: any[], usageData: any[]): string[] {
    const tips: string[] = [];

    // AC optimization tips
    const ac = appliances.find(a => a.type === 'air_conditioner');
    if (ac && ac.usageHoursPerDay > 8) {
      tips.push('Consider reducing AC usage by 2 hours daily to save ₹50-80 per day');
      tips.push('Set AC temperature to 24-26°C for optimal efficiency');
    }

    // Peak hour usage tips
    const avgDailyUsage = usageData.reduce((sum, r) => sum + r.unitsConsumed, 0) / usageData.length;
    if (avgDailyUsage > 5) {
      tips.push('Shift heavy appliance usage to off-peak hours (11 PM - 6 AM) for lower tariff rates');
    }

    // Old appliance tips
    const oldAppliances = appliances.filter(a => a.age > 5);
    if (oldAppliances.length > 0) {
      tips.push(`Consider upgrading ${oldAppliances[0].name} - newer models can be 30-40% more efficient`);
    }

    // Ghost load tips
    tips.push('Unplug electronics when not in use to eliminate standby power consumption');
    
    return tips;
  }

  /**
   * Format energy savings for display
   */
  static formatSavings(amount: number, period: 'daily' | 'monthly' | 'yearly' = 'daily'): string {
    if (period === 'yearly') {
      return `₹${(amount * 365).toLocaleString('en-IN')}/year`;
    } else if (period === 'monthly') {
      return `₹${(amount * 30).toLocaleString('en-IN')}/month`;
    }
    return `₹${amount.toFixed(0)}/day`;
  }

  /**
   * Calculate CO2 emissions saved
   */
  static calculateCO2Savings(kwhSaved: number): number {
    // Indian electricity grid CO2 factor: ~0.82 kg CO2 per kWh
    return kwhSaved * 0.82;
  }

  /**
   * Calculate trees equivalent for CO2 savings
   */
  static calculateTreesEquivalent(co2KgSaved: number): number {
    // One tree absorbs approximately 22 kg CO2 per year
    return co2KgSaved / 22;
  }
}

// Export utility functions for easier usage
export const {
  generateTips,
  analyzeBill,
  optimizeAppliance,
  calculateEfficiencyScore,
  generateSimpleTips,
  formatSavings,
  calculateCO2Savings,
  calculateTreesEquivalent,
} = EnergyAI;

// Default export
export default EnergyAI;
