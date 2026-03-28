import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, task } = await req.json();

    if (!input || !task) {
      return new Response(
        JSON.stringify({ error: "Missing input or task" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FEATHERLESS_API_KEY = Deno.env.get("FEATHERLESS_API_KEY");

    // If no API key, use intelligent rule-based fallback (demo mode)
    if (!FEATHERLESS_API_KEY) {
      console.log("No FEATHERLESS_API_KEY found, using smart fallback for task:", task);
      const result = smartFallback(input, task);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Featherless API
    const response = await fetch("https://api.featherless.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FEATHERLESS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3.1-8B-Instruct",
        messages: [
          { role: "system", content: getSystemPrompt(task) },
          { role: "user", content: input },
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Featherless API error [${response.status}]: ${errText}`);
      // Fallback on API error
      const result = smartFallback(input, task);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || "";
    const result = parseAIResponse(aiText, task, input);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getSystemPrompt(task: string): string {
  switch (task) {
    case "classification":
      return `You are a food classification AI. Given a food description, respond ONLY with valid JSON:
{"food_category": "category", "shelf_life": "estimated time", "urgency_level": "low|medium|high", "ai_tags": ["tag1", "tag2"]}`;
    case "scoring":
      return `You are a food urgency scoring AI. Given food details and expiry info, respond ONLY with valid JSON:
{"urgency_score": <number 1-10>}
Score 1=no urgency, 10=extreme urgency. Consider perishability and time remaining.`;
    case "reasoning":
      return `You are a food redistribution matching AI. Given food and NGO details, explain in 1-2 sentences why this NGO was selected. Be specific about distance, demand, and urgency. Respond ONLY with valid JSON:
{"explanation": "your explanation"}`;
    default:
      return "Respond with valid JSON.";
  }
}

function parseAIResponse(text: string, task: string, input: string): Record<string, unknown> {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    console.warn("Failed to parse AI response, using fallback");
  }
  return smartFallback(input, task);
}

function smartFallback(input: string, task: string): Record<string, unknown> {
  const lower = input.toLowerCase();

  if (task === "classification") {
    let category = "General Food";
    let shelfLife = "4-6 hours";
    let urgency = "medium";
    const tags: string[] = [];

    if (lower.includes("rice") || lower.includes("biryani") || lower.includes("pulao")) {
      category = "Rice / Grains";
      shelfLife = "4-6 hours";
      tags.push("cooked", "grain-based");
    } else if (lower.includes("bread") || lower.includes("roti") || lower.includes("naan")) {
      category = "Bread / Bakery";
      shelfLife = "12-24 hours";
      urgency = "low";
      tags.push("bakery", "dry");
    } else if (lower.includes("curry") || lower.includes("dal") || lower.includes("sabzi") || lower.includes("gravy")) {
      category = "Curry / Cooked Dish";
      shelfLife = "3-5 hours";
      urgency = "high";
      tags.push("cooked", "perishable");
    } else if (lower.includes("fruit") || lower.includes("apple") || lower.includes("banana")) {
      category = "Fruits";
      shelfLife = "1-3 days";
      urgency = "low";
      tags.push("fresh", "raw");
    } else if (lower.includes("milk") || lower.includes("dairy") || lower.includes("curd") || lower.includes("paneer")) {
      category = "Dairy";
      shelfLife = "2-4 hours";
      urgency = "high";
      tags.push("dairy", "perishable", "refrigeration-needed");
    } else if (lower.includes("vegetable") || lower.includes("salad")) {
      category = "Vegetables";
      shelfLife = "1-2 days";
      urgency = "medium";
      tags.push("fresh", "raw");
    } else if (lower.includes("sweet") || lower.includes("dessert") || lower.includes("cake")) {
      category = "Sweets / Desserts";
      shelfLife = "6-12 hours";
      tags.push("sweet", "prepared");
    } else {
      tags.push("mixed", "review-needed");
    }

    return { food_category: category, shelf_life: shelfLife, urgency_level: urgency, ai_tags: tags };
  }

  if (task === "scoring") {
    let score = 5;
    if (lower.includes("expired") || lower.includes("1 hour") || lower.includes("30 min")) score = 9;
    else if (lower.includes("2 hour") || lower.includes("3 hour")) score = 7;
    else if (lower.includes("today") || lower.includes("tonight")) score = 6;
    else if (lower.includes("tomorrow")) score = 4;
    else if (lower.includes("dairy") || lower.includes("milk") || lower.includes("curry")) score = 7;
    else if (lower.includes("bread") || lower.includes("fruit")) score = 3;
    return { urgency_score: score };
  }

  if (task === "reasoning") {
    const parts = input.split(".");
    const urgencyPart = parts.find((p) => p.includes("Urgency")) || "";
    const distancePart = parts.find((p) => p.includes("Distance")) || "";
    const ngoPart = parts.find((p) => p.includes("NGO")) || "";

    const ngoName = ngoPart.replace(/NGO:\s*/, "").replace(/at.*/, "").trim() || "This NGO";
    const distance = distancePart.replace(/Distance:\s*/, "").trim() || "nearby";
    const urgency = urgencyPart.replace(/Urgency:\s*/, "").trim() || "moderate";

    return {
      explanation: `${ngoName} was selected because it is ${distance} away, has high capacity for food distribution, and the urgency level (${urgency}) makes this a priority match. The food type aligns well with the NGO's distribution capabilities.`,
    };
  }

  return { error: "Unknown task" };
}
