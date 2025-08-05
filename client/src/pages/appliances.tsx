import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/ui/bottom-nav";
import { Edit, Trash2, Plus } from "lucide-react";
import type { Appliance } from "@shared/schema";

const applianceTypes = [
  { value: "air_conditioner", label: "Air Conditioner", icon: "fas fa-snowflake" },
  { value: "refrigerator", label: "Refrigerator", icon: "fas fa-temperature-low" },
  { value: "television", label: "Television", icon: "fas fa-tv" },
  { value: "washing_machine", label: "Washing Machine", icon: "fas fa-tshirt" },
  { value: "water_heater", label: "Water Heater", icon: "fas fa-fire" },
  { value: "microwave", label: "Microwave", icon: "fas fa-microwave" },
  { value: "fan", label: "Fan", icon: "fas fa-fan" },
  { value: "lights", label: "Lights", icon: "fas fa-lightbulb" },
  { value: "other", label: "Other", icon: "fas fa-plug" },
];

export default function Appliances() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(null);
  const [newAppliance, setNewAppliance] = useState({
    name: "",
    type: "",
    specs: "",
    powerRating: "",
    starRating: "3",
    age: "",
    usageHoursPerDay: "",
    usageStartTime: "",
    usageEndTime: "",
    icon: "fas fa-plug",
  });

  const { data: appliances = [], isLoading } = useQuery({
    queryKey: ["/api/appliances/user", user?.id],
    enabled: !!user?.id,
  });

  const createApplianceMutation = useMutation({
    mutationFn: async (applianceData: any) => {
      const response = await apiRequest("POST", "/api/appliances", {
        userId: user?.id,
        ...applianceData,
        powerRating: parseInt(applianceData.powerRating),
        starRating: parseInt(applianceData.starRating),
        age: parseInt(applianceData.age),
        usageHoursPerDay: parseFloat(applianceData.usageHoursPerDay),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appliances/user", user?.id] });
      toast({
        title: "Appliance Added!",
        description: "Your appliance has been successfully added.",
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Failed to Add Appliance",
        description: "Unable to add appliance. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateApplianceMutation = useMutation({
    mutationFn: async (applianceData: any) => {
      const response = await apiRequest("PUT", `/api/appliances/${editingAppliance?.id}`, {
        ...applianceData,
        powerRating: parseInt(applianceData.powerRating),
        starRating: parseInt(applianceData.starRating),
        age: parseInt(applianceData.age),
        usageHoursPerDay: parseFloat(applianceData.usageHoursPerDay),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appliances/user", user?.id] });
      toast({
        title: "Appliance Updated!",
        description: "Your appliance has been successfully updated.",
      });
      setIsEditDialogOpen(false);
      setEditingAppliance(null);
    },
    onError: () => {
      toast({
        title: "Failed to Update Appliance",
        description: "Unable to update appliance. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteApplianceMutation = useMutation({
    mutationFn: async (applianceId: number) => {
      const response = await apiRequest("DELETE", `/api/appliances/${applianceId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appliances/user", user?.id] });
      toast({
        title: "Appliance Deleted!",
        description: "Your appliance has been successfully removed.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Delete Appliance",
        description: "Unable to delete appliance. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setNewAppliance({
      name: "",
      type: "",
      specs: "",
      powerRating: "",
      starRating: "3",
      age: "",
      usageHoursPerDay: "",
      usageStartTime: "",
      usageEndTime: "",
      icon: "fas fa-plug",
    });
  };

  const handleTypeChange = (type: string) => {
    const selectedType = applianceTypes.find(t => t.value === type);
    setNewAppliance(prev => ({
      ...prev,
      type,
      icon: selectedType?.icon || "fas fa-plug"
    }));
  };

  const handleEditTypeChange = (type: string) => {
    const selectedType = applianceTypes.find(t => t.value === type);
    setEditingAppliance(prev => prev ? ({
      ...prev,
      type,
      icon: selectedType?.icon || "fas fa-plug"
    }) : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAppliance.name || !newAppliance.type || !newAppliance.powerRating || !newAppliance.age) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createApplianceMutation.mutate(newAppliance);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAppliance?.name || !editingAppliance?.type || !editingAppliance?.powerRating || !editingAppliance?.age) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    updateApplianceMutation.mutate({
      name: editingAppliance.name,
      type: editingAppliance.type,
      specs: editingAppliance.specs,
      powerRating: editingAppliance.powerRating.toString(),
      starRating: editingAppliance.starRating.toString(),
      age: editingAppliance.age.toString(),
      usageHoursPerDay: editingAppliance.usageHoursPerDay?.toString() || "0",
      usageStartTime: editingAppliance.usageStartTime,
      usageEndTime: editingAppliance.usageEndTime,
      icon: editingAppliance.icon,
    });
  };

  const handleEditClick = (appliance: Appliance) => {
    setEditingAppliance(appliance);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (applianceId: number) => {
    if (confirm("Are you sure you want to delete this appliance?")) {
      deleteApplianceMutation.mutate(applianceId);
    }
  };

  const calculateMonthlyCost = (appliance: Appliance) => {
    const dailyConsumption = (appliance.powerRating / 1000) * (appliance.usageHoursPerDay || 0);
    const monthlyCost = dailyConsumption * 30 * 7; // Assuming ₹7/kWh
    return Math.round(monthlyCost);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-pulse-green text-2xl text-primary font-semibold">
          Loading appliances...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Premium Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extralight minimal-text mb-2">Device Matrix</h1>
            <p className="text-sm minimal-text-muted tracking-wide">Energy Intelligence Hub</p>
          </div>
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center futuristic-glow">
            <i className="fas fa-plug text-white text-xl"></i>
          </div>
        </div>

        {/* Premium Add Device Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full mb-8 gradient-primary text-white hover:futuristic-glow transition-all duration-300 py-6 rounded-2xl font-light text-lg"
            >
              <Plus className="w-6 h-6 mr-3" />
              Add New Device
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md mx-4 glass-morphism border-0 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-gradient-primary text-xl font-light">Add New Device</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div>
                <label className="block text-sm font-light text-black mb-3">Device Name *</label>
                <Input
                  value={newAppliance.name}
                  onChange={(e) => setNewAppliance(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Living Room AC"
                  required
                  className="glass-morphism border-white/20 text-black placeholder:text-gray-500 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-light text-black mb-3">Type *</label>
                <Select value={newAppliance.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="glass-morphism border-white/20 text-black rounded-xl">
                    <SelectValue placeholder="Select device type" className="text-gray-500" />
                  </SelectTrigger>
                  <SelectContent className="glass-morphism border-white/20 rounded-xl">
                    {applianceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-black hover:bg-gray-100">
                        <div className="flex items-center gap-2">
                          <i className={type.icon}></i>
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-light text-black mb-3">Power Rating (W) *</label>
                  <Input
                    type="number"
                    value={newAppliance.powerRating}
                    onChange={(e) => setNewAppliance(prev => ({ ...prev, powerRating: e.target.value }))}
                    placeholder="1500"
                    required
                    className="glass-morphism border-white/20 text-black placeholder:text-gray-500 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-black mb-3">Age (years) *</label>
                  <Input
                    type="number"
                    value={newAppliance.age}
                    onChange={(e) => setNewAppliance(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="3"
                    required
                    className="glass-morphism border-white/20 text-black placeholder:text-gray-500 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-light text-black mb-3">Star Rating</label>
                  <Select 
                    value={newAppliance.starRating} 
                    onValueChange={(value) => setNewAppliance(prev => ({ ...prev, starRating: value }))}
                  >
                    <SelectTrigger className="glass-morphism border-white/20 text-black rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-morphism border-white/20 rounded-xl">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <SelectItem key={star} value={star.toString()} className="text-black hover:bg-gray-100">
                          {star} ⭐
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-light text-black mb-3">Usage Hours/Day</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={newAppliance.usageHoursPerDay}
                    onChange={(e) => setNewAppliance(prev => ({ ...prev, usageHoursPerDay: e.target.value }))}
                    placeholder="8"
                    className="glass-morphism border-white/20 text-black placeholder:text-gray-500 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-light text-black mb-3">Start Time</label>
                  <Input
                    type="time"
                    value={newAppliance.usageStartTime}
                    onChange={(e) => setNewAppliance(prev => ({ ...prev, usageStartTime: e.target.value }))}
                    className="glass-morphism border-white/20 text-black rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-black mb-3">End Time</label>
                  <Input
                    type="time"
                    value={newAppliance.usageEndTime}
                    onChange={(e) => setNewAppliance(prev => ({ ...prev, usageEndTime: e.target.value }))}
                    className="glass-morphism border-white/20 text-black rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-light text-black mb-3">Specifications</label>
                <Input
                  value={newAppliance.specs}
                  onChange={(e) => setNewAppliance(prev => ({ ...prev, specs: e.target.value }))}
                  placeholder="e.g., 1.5 Ton, 5 Star, Inverter"
                  className="glass-morphism border-white/20 text-black placeholder:text-gray-500 rounded-xl"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1 glass-morphism border-white/20 text-black hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 gradient-primary text-white hover:futuristic-glow rounded-xl"
                  disabled={createApplianceMutation.isPending}
                >
                  {createApplianceMutation.isPending ? "Adding Device..." : "Add Device"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Appliance Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-gradient-green">Edit Appliance</DialogTitle>
            </DialogHeader>
            {editingAppliance && (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Appliance Name *</label>
                  <Input
                    value={editingAppliance.name}
                    onChange={(e) => setEditingAppliance(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    placeholder="e.g., Living Room AC"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type *</label>
                  <Select value={editingAppliance.type} onValueChange={handleEditTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select appliance type" />
                    </SelectTrigger>
                    <SelectContent>
                      {applianceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <i className={type.icon}></i>
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Power Rating (W) *</label>
                    <Input
                      type="number"
                      value={editingAppliance.powerRating}
                      onChange={(e) => setEditingAppliance(prev => prev ? ({ ...prev, powerRating: parseInt(e.target.value) }) : null)}
                      placeholder="1500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Age (years) *</label>
                    <Input
                      type="number"
                      value={editingAppliance.age}
                      onChange={(e) => setEditingAppliance(prev => prev ? ({ ...prev, age: parseInt(e.target.value) }) : null)}
                      placeholder="3"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Star Rating</label>
                    <Select 
                      value={editingAppliance.starRating?.toString()} 
                      onValueChange={(value) => setEditingAppliance(prev => prev ? ({ ...prev, starRating: parseInt(value) }) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <SelectItem key={star} value={star.toString()}>
                            {star} ⭐
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Usage Hours/Day</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={editingAppliance.usageHoursPerDay}
                      onChange={(e) => setEditingAppliance(prev => prev ? ({ ...prev, usageHoursPerDay: parseFloat(e.target.value) }) : null)}
                      placeholder="8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Time</label>
                    <Input
                      type="time"
                      value={editingAppliance.usageStartTime || ''}
                      onChange={(e) => setEditingAppliance(prev => prev ? ({ ...prev, usageStartTime: e.target.value }) : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Time</label>
                    <Input
                      type="time"
                      value={editingAppliance.usageEndTime || ''}
                      onChange={(e) => setEditingAppliance(prev => prev ? ({ ...prev, usageEndTime: e.target.value }) : null)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Specifications</label>
                  <Input
                    value={editingAppliance.specs || ''}
                    onChange={(e) => setEditingAppliance(prev => prev ? ({ ...prev, specs: e.target.value }) : null)}
                    placeholder="e.g., 1.5 Ton, 5 Star, Inverter"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingAppliance(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gradient-green text-white"
                    disabled={updateApplianceMutation.isPending}
                  >
                    {updateApplianceMutation.isPending ? "Updating..." : "Update Appliance"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Device Matrix List */}
        {appliances.length === 0 ? (
          <Card className="neo-card rounded-3xl border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center futuristic-glow mx-auto mb-6">
                <i className="fas fa-plug text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-light minimal-text mb-4">No Devices Detected</h3>
              <p className="minimal-text-muted mb-6 leading-relaxed">Start adding your smart home devices to track energy consumption</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {appliances.map((appliance: Appliance) => (
              <Card key={appliance.id} className="neo-card rounded-3xl border-0 shadow-xl hover:futuristic-glow transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center futuristic-glow">
                        <i className={`${appliance.icon} text-xl text-white`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-light minimal-text text-lg">{appliance.name}</h3>
                          <div className="flex">
                            {Array.from({ length: appliance.starRating || 1 }, (_, i) => (
                              <span key={i} className="text-accent text-sm">⭐</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm minimal-text-muted capitalize mb-3">
                          {appliance.type.replace('_', ' ')} • {appliance.powerRating}W • {appliance.age} years old
                        </p>
                        {appliance.specs && (
                          <p className="text-xs text-gray-500 mb-2">{appliance.specs}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {appliance.usageHoursPerDay && (
                            <span>📊 {appliance.usageHoursPerDay}h/day</span>
                          )}
                          {appliance.usageStartTime && appliance.usageEndTime && (
                            <span>⏰ {appliance.usageStartTime} - {appliance.usageEndTime}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="bg-green-100 px-3 py-1 rounded-full">
                            <span className="text-sm font-medium text-green-700">
                              ₹{calculateMonthlyCost(appliance)}/month
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(appliance)}
                        className="p-2 h-8 w-8 border-green-200 hover:bg-green-50"
                      >
                        <Edit className="w-3 h-3 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(appliance.id)}
                        className="p-2 h-8 w-8 border-red-200 hover:bg-red-50"
                        disabled={deleteApplianceMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
}