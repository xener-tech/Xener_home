import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Zap, 
  Menu, 
  Camera, 
  Settings, 
  BarChart3, 
  Lightbulb, 
  LogOut,
  IndianRupee,
  TrendingUp,
  Activity
} from "lucide-react";
import { Link } from "wouter";
import BottomNav from "@/components/ui/bottom-nav";

interface DashboardData {
  todayUsage: number;
  todayCost: number;
  monthlyUsage: number;
  monthlyCost: number;
  energyScore: number;
  topAppliance: string;
  savingsOpportunity: number;
  carbonFootprint: number;
}

interface Appliance {
  id: number;
  name: string;
  type: string;
  powerRating: number;
  icon: string;
}

interface Bill {
  id: number;
  billTotal: number;
  unitsConsumed: number;
  tariffRate: number;
  dueDate: string;
  sanctionedLoad: number;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: dashboardData } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard', user?.uid],
    enabled: !!user?.uid,
  });

  const { data: appliances = [] } = useQuery<Appliance[]>({
    queryKey: ['/api/appliances/user', user?.uid],
    enabled: !!user?.uid,
  });

  const { data: latestBill } = useQuery<Bill>({
    queryKey: ['/api/bills/latest', user?.uid],
    enabled: !!user?.uid,
  });

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  if (!user) {
    return <div>Please log in to view dashboard</div>;
  }

  // Simulated real-time data
  const currentLoadDemand = 2.3 + Math.sin(Date.now() / 10000) * 0.5;
  const powerFactor = 0.85 + Math.random() * 0.1;
  const peakLoadDemand = 4.2;
  const gridFrequency = 50.0 + (Math.random() - 0.5) * 0.4;
  
  const sanctionedLoad = latestBill?.sanctionedLoad || `${Math.ceil(peakLoadDemand)} kW`;
  const monthlyUnits = latestBill?.unitsConsumed || dashboardData?.monthlyUsage || 0;
  const tariffRate = latestBill?.tariffRate || 6.5;
  
  const data: DashboardData = dashboardData || {
    todayUsage: 0,
    todayCost: 0,
    monthlyUsage: monthlyUnits,
    monthlyCost: monthlyUnits * tariffRate,
    energyScore: Math.round(powerFactor * 100),
    topAppliance: appliances.length > 0 ? appliances[0]?.name : "No appliances",
    savingsOpportunity: 0,
    carbonFootprint: 0,
  };

  const menuItems = [
    { label: "Analytics", icon: BarChart3, path: "/analytics", description: "Energy insights" },
    { label: "Bill Upload", icon: Camera, path: "/bill-upload", description: "Scan & analyze bills" },
    { label: "Appliances", icon: Settings, path: "/appliances", description: "Manage devices" },
    { label: "Tips", icon: Lightbulb, path: "/tips", description: "AI recommendations" },
  ];

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Clean Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2">
              {user?.displayName?.split(' ')[0] || 'Xener'}
            </h1>
            <p className="text-sm text-gray-500 tracking-wide">Smart Energy Dashboard</p>
          </div>
          
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-2xl bg-white shadow-md w-14 h-14 hover:shadow-lg transition-shadow">
                <Menu className="w-6 h-6 text-gray-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white border-l border-gray-200">
              <SheetHeader className="mb-8">
                <SheetTitle className="text-left text-xl font-light text-gray-900">Navigation</SheetTitle>
              </SheetHeader>
              
              <div className="py-6 space-y-4">
                {menuItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-auto p-6 text-left bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="gradient-primary p-3 rounded-xl">
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-lg">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                    </Button>
                  </Link>
                ))}
                
                <div className="border-t border-gray-200 pt-6 mt-8">
                  <Button
                    variant="ghost"
                    className="w-full justify-start bg-red-50 rounded-2xl p-4 hover:bg-red-100 transition-all duration-300"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-5 h-5 mr-4 text-red-500" />
                    <span className="text-gray-900 font-medium">Sign Out</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Energy Overview */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card className="neo-card rounded-3xl border shadow-lg overflow-hidden">
            <CardContent className="p-8 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">TODAY'S USAGE</p>
                  <p className="text-4xl font-light text-gradient-primary">{data.todayUsage || currentLoadDemand.toFixed(1)} kWh</p>
                  <p className="text-xs text-gray-500 mt-1">Real-time monitoring</p>
                </div>
                <div className="relative">
                  <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2 tracking-wide">COST</p>
                  <p className="text-2xl font-medium text-gray-900">₹{data.todayCost || Math.round(currentLoadDemand * tariffRate)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2 tracking-wide">EFFICIENCY</p>
                  <p className="text-2xl font-medium text-gradient-accent">{Math.round(powerFactor * 100)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2 tracking-wide">STATUS</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-green-700 font-medium">OPTIMAL</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Energy Score */}
        <Card className="mb-8 neo-card rounded-3xl border shadow-lg">
          <CardContent className="p-8 bg-gradient-to-br from-green-50 to-blue-50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-4">ENERGY EFFICIENCY SCORE</p>
                <p className="text-5xl font-light text-gradient-primary mb-2">{data.energyScore}</p>
                <p className="text-sm text-gray-600 font-medium">
                  {data.energyScore >= 80 ? "Excellent Performance" : 
                   data.energyScore >= 60 ? "Good Efficiency" : 
                   data.energyScore >= 40 ? "Average Rating" : "Needs Improvement"}
                </p>
              </div>
              <div className="w-24 h-24 gradient-accent rounded-2xl flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-medium text-white mb-1">{data.energyScore}%</div>
                  <div className="text-xs text-white/90 font-medium tracking-wide">SCORE</div>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="gradient-primary h-3 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${data.energyScore}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Bill Information */}
        {latestBill && (
          <Card className="mb-8 neo-card rounded-3xl border shadow-lg">
            <CardContent className="p-8 bg-gradient-to-br from-yellow-50 to-orange-50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Latest Bill</h3>
                <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center p-6 bg-white/50 rounded-2xl">
                  <p className="text-xs text-gray-500 mb-3 tracking-wide">TOTAL AMOUNT</p>
                  <p className="text-3xl font-medium text-gray-900">₹{latestBill.billTotal}</p>
                </div>
                <div className="text-center p-6 bg-white/50 rounded-2xl">
                  <p className="text-xs text-gray-500 mb-3 tracking-wide">CONSUMPTION</p>
                  <p className="text-3xl font-medium text-gradient-accent">{latestBill.unitsConsumed}</p>
                  <p className="text-xs text-gray-500 mt-1">kWh</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/30 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">TARIFF RATE</p>
                  <p className="text-lg font-medium text-gray-900">₹{tariffRate}/kWh</p>
                </div>
                <div className="text-center p-4 bg-white/30 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">DUE DATE</p>
                  <p className="text-lg font-medium text-gray-900">{latestBill.dueDate || 'Not set'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Control Panel */}
        <Card className="mb-8 neo-card rounded-3xl border shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <Link href="/bill-upload">
                <Button variant="ghost" className="w-full h-20 bg-gray-50 rounded-2xl flex-col gap-3 hover:bg-gray-100 transition-all duration-300">
                  <div className="w-10 h-10 gradient-secondary rounded-xl flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Scan Bill</span>
                </Button>
              </Link>
              <Link href="/appliances">
                <Button variant="ghost" className="w-full h-20 bg-gray-50 rounded-2xl flex-col gap-3 hover:bg-gray-100 transition-all duration-300">
                  <div className="w-10 h-10 gradient-orange rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Add Device</span>
                </Button>
              </Link>
            </div>
            
            {appliances.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {appliances.length} Device{appliances.length !== 1 ? 's' : ''} Connected
                    </p>
                    <p className="text-xs text-gray-500">
                      Primary: {data.topAppliance || appliances[0]?.name || "Unknown"}
                    </p>
                  </div>
                  <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{appliances.length}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <BottomNav />
      </div>
    </div>
  );
}