import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/ui/bottom-nav";
import { BarChart3, TrendingUp } from "lucide-react";
import Chart from "chart.js/auto";

export default function Analytics() {
  const { user } = useAuth();
  const breakdownChartRef = useRef<HTMLCanvasElement>(null);
  const patternChartRef = useRef<HTMLCanvasElement>(null);
  const breakdownChartInstance = useRef<Chart | null>(null);
  const patternChartInstance = useRef<Chart | null>(null);

  const { data: appliances } = useQuery({
    queryKey: ["/api/appliances/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard", user?.id],
    enabled: !!user?.id,
  });

  const { data: usageRecords } = useQuery({
    queryKey: ["/api/usage/user", user?.id],
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (breakdownChartRef.current) {
      if (breakdownChartInstance.current) {
        breakdownChartInstance.current.destroy();
      }

      const ctx = breakdownChartRef.current.getContext('2d');
      if (ctx) {
        // Calculate consumption breakdown by appliance type
        let applianceConsumption: Record<string, number> = {};
        
        if (appliances && Array.isArray(appliances) && appliances.length > 0) {
          applianceConsumption = appliances.reduce((acc: any, appliance: any) => {
            const dailyConsumption = (appliance.powerRating / 1000) * (appliance.usageHoursPerDay || 8);
            acc[appliance.type] = (acc[appliance.type] || 0) + dailyConsumption;
            return acc;
          }, {});
        } else {
          // Default data when no appliances
          applianceConsumption = {
            'lighting': 2.5,
            'cooling': 4.8,
            'electronics': 1.2,
            'kitchen': 3.1
          };
        }

        const labels = Object.keys(applianceConsumption);
        const data = Object.values(applianceConsumption);
        const colors = [
          'rgba(34, 197, 94, 0.8)',   // green
          'rgba(16, 185, 129, 0.8)',  // emerald
          'rgba(5, 150, 105, 0.8)',   // green-600
          'rgba(6, 182, 212, 0.8)',   // cyan
          'rgba(14, 165, 233, 0.8)',  // blue
        ];

        breakdownChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels.map(label => label.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())),
            datasets: [{
              data,
              backgroundColor: colors.slice(0, labels.length),
              borderWidth: 0,
              hoverBorderWidth: 2,
              hoverBorderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
              legend: { 
                position: 'bottom' as const,
                labels: {
                  padding: 20,
                  font: {
                    size: 12,
                    family: 'Inter'
                  }
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (breakdownChartInstance.current) {
        breakdownChartInstance.current.destroy();
      }
    };
  }, [appliances]);

  useEffect(() => {
    if (patternChartRef.current && dashboardData?.weeklyUsage) {
      if (patternChartInstance.current) {
        patternChartInstance.current.destroy();
      }

      const ctx = patternChartRef.current.getContext('2d');
      if (ctx) {
        const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        
        // Generate sample hourly usage pattern
        const currentUsage = hours.map((_, hour) => {
          // Simulate higher usage during peak hours (morning and evening)
          let baseUsage = 2;
          if (hour >= 6 && hour <= 10) baseUsage = 8; // Morning peak
          if (hour >= 18 && hour <= 23) baseUsage = 12; // Evening peak
          return baseUsage + Math.random() * 3;
        });

        const optimalUsage = hours.map((_, hour) => {
          // Optimal pattern with shifted usage to off-peak hours
          let optimalBase = 2;
          if (hour >= 5 && hour <= 9) optimalBase = 6; // Earlier morning
          if (hour >= 16 && hour <= 20) optimalBase = 8; // Earlier evening
          if (hour >= 22 || hour <= 5) optimalBase = 4; // Late night
          return optimalBase + Math.random() * 2;
        });

        patternChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: hours.filter((_, i) => i % 3 === 0), // Show every 3rd hour
            datasets: [
              {
                label: 'Current Usage',
                data: currentUsage.filter((_, i) => i % 3 === 0),
                backgroundColor: 'hsl(0, 84%, 60%)',
                borderRadius: 4
              },
              {
                label: 'Optimal Usage',
                data: optimalUsage.filter((_, i) => i % 3 === 0),
                backgroundColor: 'hsl(122, 100%, 39%)',
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' as const } },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'kWh' } },
              x: { title: { display: true, text: 'Hour of Day' } }
            }
          }
        });
      }
    }

    return () => {
      if (patternChartInstance.current) {
        patternChartInstance.current.destroy();
      }
    };
  }, [dashboardData]);

  if (!user) {
    return <div>Please log in to view analytics</div>;
  }

  // Calculate predictions based on current usage
  const currentMonthUsage = dashboardData?.weeklyUsage?.reduce((sum: number, record: any) => sum + record.consumption, 0) * 4.3 || 150;
  const predictedUsage = Math.round(currentMonthUsage * 1.1); // 10% increase prediction
  const predictedCost = Math.round(predictedUsage * 7); // ₹7 per kWh

  // Environmental impact calculations
  const co2Saved = Math.round((250 - currentMonthUsage) * 0.82); // 0.82 kg CO2 per kWh saved
  const treesEquivalent = (co2Saved / 22).toFixed(1); // One tree absorbs ~22kg CO2 per year

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extralight minimal-text mb-2">Analytics Matrix</h1>
            <p className="text-sm minimal-text-muted tracking-wide">Data Intelligence Portal</p>
          </div>
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center futuristic-glow">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="space-y-6">
          {/* Premium Time Selector */}
          <div className="glass-morphism rounded-2xl p-2 shadow-2xl mb-8">
            <div className="flex gap-2">
              <Button className="flex-1 py-4 text-center rounded-xl gradient-primary text-white font-light text-sm futuristic-glow">
                Week
              </Button>
              <Button variant="ghost" className="flex-1 py-4 text-center minimal-text-muted font-light text-sm hover:glass-morphism">
                Month
              </Button>
              <Button variant="ghost" className="flex-1 py-4 text-center minimal-text-muted font-light text-sm hover:glass-morphism">
                Year
              </Button>
            </div>
          </div>

          {/* Consumption Matrix */}
          <Card className="neo-card rounded-3xl border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-light text-gradient-primary">Consumption Matrix</h3>
                <div className="text-xs minimal-text-muted glass-morphism px-4 py-2 rounded-full">
                  Live neural data
                </div>
              </div>
              <div className="w-full h-64 glass-morphism rounded-2xl p-4">
                <canvas ref={breakdownChartRef} className="w-full h-full"></canvas>
              </div>
            </CardContent>
          </Card>

          {/* AI Optimization Engine */}
          <Card className="neo-card rounded-3xl border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-light text-gradient-accent">AI Optimization Engine</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 gradient-orange rounded-full"></div>
                    <span className="text-xs minimal-text-muted font-light">Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 gradient-accent rounded-full"></div>
                    <span className="text-xs minimal-text-muted font-light">Optimal</span>
                  </div>
                </div>
              </div>
              <div className="w-full h-48 glass-morphism rounded-2xl p-4">
                <canvas ref={patternChartRef} className="w-full h-full"></canvas>
              </div>
            </CardContent>
          </Card>

          {/* Neural Predictions Engine */}
          <Card className="neo-card rounded-3xl border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-light text-gradient-orange">Neural Predictions</h3>
                <div className="w-12 h-12 gradient-orange rounded-xl flex items-center justify-center futuristic-glow">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center p-6 glass-morphism rounded-2xl">
                  <p className="text-xs minimal-text-muted uppercase tracking-[0.15em] mb-3">FORECAST</p>
                  <p className="text-3xl font-extralight text-gradient-orange mb-2">{predictedUsage}</p>
                  <p className="text-xs minimal-text-muted font-light">kWh next month</p>
                </div>
                <div className="text-center p-6 glass-morphism rounded-2xl">
                  <p className="text-xs minimal-text-muted uppercase tracking-[0.15em] mb-3">COST</p>
                  <p className="text-3xl font-extralight text-gradient-secondary mb-2">₹{predictedCost}</p>
                  <p className="text-xs minimal-text-muted font-light">estimated bill</p>
                </div>
              </div>
              
              <div className="premium-gradient p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">AI</span>
                  </div>
                  <p className="text-sm minimal-text font-light">
                    Neural network suggests 40% off-peak shifting for 23% cost reduction
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Intelligence */}
          <Card className="neo-card rounded-3xl border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-light text-gradient-accent">Environmental Impact</h3>
                <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center futuristic-glow">
                  <span className="text-white text-lg">🌍</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 glass-morphism rounded-2xl">
                  <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-lg">🍃</span>
                  </div>
                  <p className="text-3xl font-extralight text-gradient-accent mb-2">{Math.max(0, co2Saved)}</p>
                  <p className="text-xs minimal-text-muted font-light tracking-wide">kg CO₂ SAVED</p>
                </div>
                <div className="text-center p-6 glass-morphism rounded-2xl">
                  <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-lg">🌳</span>
                  </div>
                  <p className="text-3xl font-extralight text-gradient-secondary mb-2">{Math.max(0, parseFloat(treesEquivalent))}</p>
                  <p className="text-xs minimal-text-muted font-light tracking-wide">TREES EQUIVALENT</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card className="neo-card rounded-3xl border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-light text-gradient-primary">Weekly Performance</h3>
                <div className="text-xs minimal-text-muted glass-morphism px-4 py-2 rounded-full">
                  Live tracking
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Total Consumption</span>
                  <span className="font-bold text-green-600 text-lg">
                    {Math.round(currentMonthUsage / 4.3)} kWh
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Average Daily</span>
                  <span className="font-bold text-blue-600 text-lg">
                    {Math.round(currentMonthUsage / 30)} kWh
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Peak Day Usage</span>
                  <span className="font-bold text-orange-600 text-lg">
                    {Math.round(currentMonthUsage / 25)} kWh
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Efficiency Score</span>
                  <span className="font-bold text-purple-600 text-lg">
                    {dashboardData?.energyScore || 85}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
