import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { classifyFood, predictUrgency } from "@/lib/ai-service";
import Navbar from "@/components/Navbar";
import AIExplanation from "@/components/AIExplanation";
import UrgencyBadge from "@/components/UrgencyBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bot, Loader2, Package, Send, Sparkles } from "lucide-react";

const DonatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);

  const [form, setForm] = useState({
    food_description: "",
    quantity: "",
    location: "",
    expiry_time: "",
    donor_name: "",
  });

  const [aiResult, setAiResult] = useState<{
    food_category: string;
    shelf_life: string;
    urgency_level: string;
    ai_tags: string[];
    urgency_score?: number;
  } | null>(null);

  const handleClassify = async () => {
    if (!form.food_description.trim()) {
      toast({ title: "Enter a food description first", variant: "destructive" });
      return;
    }
    setIsClassifying(true);
    try {
      const classification = await classifyFood(form.food_description);
      let urgencyData = { urgency_score: 5 };
      if (form.expiry_time) {
        urgencyData = await predictUrgency(form.food_description, form.expiry_time);
      }
      setAiResult({ ...classification, urgency_score: urgencyData.urgency_score });
      toast({ title: "AI classification complete!" });
    } catch (err) {
      console.error(err);
      toast({ title: "AI classification failed", description: "Using defaults", variant: "destructive" });
      setAiResult({
        food_category: "General",
        shelf_life: "Unknown",
        urgency_level: "medium",
        ai_tags: ["unclassified"],
        urgency_score: 5,
      });
    }
    setIsClassifying(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.food_description || !form.quantity || !form.location || !form.donor_name) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    // Classify if not done yet
    let finalAi = aiResult;
    if (!finalAi) {
      try {
        const classification = await classifyFood(form.food_description);
        const urgencyData = form.expiry_time
          ? await predictUrgency(form.food_description, form.expiry_time)
          : { urgency_score: 5 };
        finalAi = { ...classification, urgency_score: urgencyData.urgency_score };
      } catch {
        finalAi = {
          food_category: "General",
          shelf_life: "Unknown",
          urgency_level: "medium",
          ai_tags: ["unclassified"],
          urgency_score: 5,
        };
      }
    }

    const { error } = await supabase.from("food_listings").insert({
      food_description: form.food_description,
      quantity: form.quantity,
      location: form.location,
      expiry_time: form.expiry_time || null,
      donor_name: form.donor_name,
      food_category: finalAi.food_category,
      urgency_score: finalAi.urgency_score || 5,
      ai_tags: finalAi.ai_tags,
      status: "available",
    });

    if (error) {
      console.error(error);
      toast({ title: "Failed to submit", variant: "destructive" });
    } else {
      toast({ title: "Food listing created!", description: "AI matching will begin shortly." });
      navigate("/matches");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Donate Surplus Food</h1>
        <p className="text-muted-foreground mb-8">
          Describe your food and let AI classify it for optimal matching.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Food Description + AI */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Food Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="food_description">Food Description *</Label>
                <Textarea
                  id="food_description"
                  placeholder="e.g., 50 packets of cooked rice, 20 loaves of bread, leftover curry..."
                  value={form.food_description}
                  onChange={(e) => setForm({ ...form, food_description: e.target.value })}
                  className="mt-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleClassify}
                  disabled={isClassifying}
                >
                  {isClassifying ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2 text-ai-glow" />
                  )}
                  Classify with AI
                </Button>
              </div>

              {/* AI Result Display */}
              {aiResult && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Bot className="h-4 w-4 text-ai-glow" />
                    AI Classification Result
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="font-heading font-semibold text-foreground">{aiResult.food_category}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Shelf Life</p>
                      <p className="font-heading font-semibold text-foreground">{aiResult.shelf_life}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiResult.urgency_score !== undefined && (
                      <UrgencyBadge score={aiResult.urgency_score} />
                    )}
                    {aiResult.ai_tags?.map((tag) => (
                      <Badge key={tag} variant="ai" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    placeholder="e.g., 50 packets"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="expiry_time">Expiry Time</Label>
                  <Input
                    id="expiry_time"
                    type="datetime-local"
                    value={form.expiry_time}
                    onChange={(e) => setForm({ ...form, expiry_time: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Sector 15, Gurugram"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="donor_name">Your Name *</Label>
                <Input
                  id="donor_name"
                  placeholder="Your name or organization"
                  value={form.donor_name}
                  onChange={(e) => setForm({ ...form, donor_name: e.target.value })}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Send className="h-5 w-5 mr-2" />
            )}
            Submit & Match with AI
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DonatePage;
