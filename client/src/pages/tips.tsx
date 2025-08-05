import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/ui/bottom-nav";
import type { AiTip } from "@shared/schema";

const tipCategories = [
  { id: "cooling", label: "Cooling Tips", icon: "fas fa-snowflake", color: "text-primary" },
  { id: "timing", label: "Time-based", icon: "fas fa-clock", color: "text-secondary" },
  { id: "home", label: "Home Setup", icon: "fas fa-home", color: "text-warning" },
  { id: "ghost", label: "Ghost Loads", icon: "fas fa-ghost", color: "text-error" },
];

export default function Tips() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: tips, isLoading } = useQuery({
    queryKey: ["/api/tips/user", user?.id],
    enabled: !!user?.id,
  });

  const generateTipsMutation = useMutation({
    mutationFn: async () => {
      const [appliances, usageData] = await Promise.all([
        fetch(`/api/appliances/user/${user?.id}`).then(r => r.json()),
        fetch(`/api/usage/user/${user?.id}`).then(r => r.json())
      ]);

      const response = await apiRequest("POST", "/api/tips/generate", {
        userId: user?.id,
        appliances,
        usageData
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tips/user", user?.id] });
      toast({
        title: "New Tips Generated!",
        description: "Fresh AI-powered recommendations are ready for you.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Generate Tips",
        description: "Unable to generate new tips. Please try again later.",
        variant: "destructive",
      });
    }
  });

  const bookmarkMutation = useMutation({
    mutationFn: async ({ tipId, isBookmarked }: { tipId: number; isBookmarked: boolean }) => {
      const response = await apiRequest("PUT", `/api/tips/${tipId}/bookmark`, { isBookmarked });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tips/user", user?.id] });
      toast({
        title: "Tip Updated",
        description: "Bookmark status updated successfully.",
      });
    }
  });

  if (!user) {
    return <div>Please log in to view tips</div>;
  }

  const filteredTips = selectedCategory 
    ? tips?.filter((tip: AiTip) => tip.category === selectedCategory)
    : tips;

  const latestTip = tips?.[0];

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extralight minimal-text mb-2">AI Intelligence</h1>
            <p className="text-sm minimal-text-muted tracking-wide">Smart Energy Recommendations</p>
          </div>
          <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center futuristic-glow">
            <Button
              onClick={() => generateTipsMutation.mutate()}
              disabled={generateTipsMutation.isPending}
              variant="ghost"
              size="sm"
              className="w-full h-full rounded-2xl hover:bg-white/10"
            >
              {generateTipsMutation.isPending ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <i className="fas fa-lightbulb text-white text-xl"></i>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
        {/* Neural Tip Highlight */}
        {latestTip && (
          <Card className="neo-card rounded-3xl border-0 shadow-2xl mb-8">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center futuristic-glow">
                  <i className="fas fa-lightbulb text-white text-xl"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-light text-gradient-accent mb-3">Today's Neural Insight</h3>
                  <p className="minimal-text mb-4 leading-relaxed">{latestTip.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    {latestTip.savingsAmount && (
                      <span className="glass-morphism px-4 py-2 rounded-full minimal-text">
                        Save ₹{latestTip.savingsAmount}/day
                      </span>
                    )}
                    <span className="premium-gradient px-4 py-2 rounded-full minimal-text border border-white/10">
                      {latestTip.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Neural Categories */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {tipCategories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(
                selectedCategory === category.id ? null : category.id
              )}
              variant="ghost"
              className={`glass-morphism rounded-2xl p-6 text-left hover:futuristic-glow h-auto flex flex-col items-start space-y-3 transition-all duration-300 ${
                selectedCategory === category.id ? 'gradient-primary text-white futuristic-glow' : ''
              }`}
            >
              <i className={`${category.icon} text-2xl ${selectedCategory === category.id ? 'text-white' : 'text-gradient-primary'}`}></i>
              <h4 className={`font-light ${selectedCategory === category.id ? 'text-white' : 'minimal-text'}`}>{category.label}</h4>
              <p className={`text-xs ${selectedCategory === category.id ? 'text-white/80' : 'minimal-text-muted'}`}>
                {category.id === 'cooling' && 'AC & Fan optimization'}
                {category.id === 'timing' && 'Peak hour strategies'}
                {category.id === 'home' && 'Insulation & efficiency'}
                {category.id === 'ghost' && 'Hidden consumption'}
              </p>
            </Button>
          ))}
        </div>

        {/* Category Filter Reset */}
        {selectedCategory && (
          <div className="flex justify-center">
            <Button
              onClick={() => setSelectedCategory(null)}
              variant="outline"
              size="sm"
            >
              Show All Tips
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* No Tips State */}
        {!isLoading && (!tips || tips.length === 0) && (
          <Card className="neo-card rounded-3xl border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center futuristic-glow mx-auto mb-6">
                <i className="fas fa-lightbulb text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-light minimal-text mb-4">No Neural Insights Yet</h3>
              <p className="minimal-text-muted mb-6 leading-relaxed">
                Generate personalized energy-saving insights based on your devices and usage patterns.
              </p>
              <Button
                onClick={() => generateTipsMutation.mutate()}
                disabled={generateTipsMutation.isPending}
                className="gradient-accent text-white px-8 py-4 rounded-2xl font-light hover:futuristic-glow transition-all duration-300"
              >
                {generateTipsMutation.isPending ? "Neural Processing..." : "Generate AI Insights"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Neural Tips List */}
        {filteredTips && filteredTips.length > 0 && (
          <div className="space-y-6">
            {filteredTips.map((tip: AiTip) => (
              <Card key={tip.id} className="neo-card rounded-3xl border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center flex-shrink-0 futuristic-glow">
                      <i className={`${
                        tipCategories.find(c => c.id === tip.category)?.icon || 'fas fa-bolt'
                      } text-white text-lg`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-light minimal-text text-lg mb-2">{tip.title}</h4>
                      <p className="text-sm minimal-text-muted mb-4 leading-relaxed">{tip.description}</p>
                      <div className="flex items-center space-x-3 text-xs">
                        {tip.savingsAmount && (
                          <span className="glass-morphism px-3 py-2 rounded-full minimal-text border border-white/10">
                            ₹{tip.savingsAmount}/day
                          </span>
                        )}
                        <span className="premium-gradient px-3 py-2 rounded-full minimal-text border border-white/10">
                          {tip.difficulty}
                        </span>
                        <span className="minimal-text-muted">
                          {new Date(tip.createdAt!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => bookmarkMutation.mutate({
                        tipId: tip.id,
                        isBookmarked: !tip.isBookmarked
                      })}
                      disabled={bookmarkMutation.isPending}
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
                    >
                      <i className={tip.isBookmarked ? "fas fa-bookmark text-accent" : "far fa-bookmark"}></i>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* AI Engine Status */}
        <Card className="neo-card rounded-3xl border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 gradient-accent rounded-2xl flex items-center justify-center animate-pulse futuristic-glow">
                <i className="fas fa-brain text-white text-lg"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-light minimal-text text-lg mb-2">Neural Learning Active</h4>
                <p className="text-sm minimal-text-muted leading-relaxed">
                  AI continuously adapts to your energy patterns for ultra-personalized insights.
                </p>
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
