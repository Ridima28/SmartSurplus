import { supabase } from "@/integrations/supabase/client";

// Simulate Featherless AI API calls via edge function
export async function classifyFood(description: string): Promise<{
  food_category: string;
  shelf_life: string;
  urgency_level: string;
  ai_tags: string[];
}> {
  const { data, error } = await supabase.functions.invoke("ai-processor", {
    body: { input: description, task: "classification" },
  });
  if (error) throw error;
  return data;
}

export async function predictUrgency(
  description: string,
  expiryTime: string
): Promise<{ urgency_score: number }> {
  const { data, error } = await supabase.functions.invoke("ai-processor", {
    body: {
      input: `Food: ${description}. Expiry: ${expiryTime}`,
      task: "scoring",
    },
  });
  if (error) throw error;
  return data;
}

export async function generateMatchExplanation(
  foodDescription: string,
  ngoName: string,
  ngoLocation: string,
  urgencyScore: number,
  distance: number
): Promise<{ explanation: string }> {
  const { data, error } = await supabase.functions.invoke("ai-processor", {
    body: {
      input: `Food: ${foodDescription}. NGO: ${ngoName} at ${ngoLocation}. Urgency: ${urgencyScore}/10. Distance: ${distance}km.`,
      task: "reasoning",
    },
  });
  if (error) throw error;
  return data;
}
