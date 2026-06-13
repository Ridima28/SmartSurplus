import { convertToModelMessages, streamText, type UIMessage } from "npm:ai";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createLovableAiGatewayProvider } from "../_shared/ai-gateway.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are AgriAdvisor AI, the agricultural advisory assistant powering PahadiCrop AI.
You specialize in mountain agriculture for Uttarakhand, India.

You ONLY provide advice on:
- Crop diseases and diagnosis
- Pest management (integrated, organic, and chemical options where appropriate)
- Soil health and fertility
- Irrigation and water management on terraced hill farms
- Organic farming practices
- Post-harvest handling and storage
- Weather-aware crop planning for hill regions

Strict rules:
- Be practical, concise, and actionable. Use short paragraphs and bullet lists.
- Tailor advice to small-holder hill farmers (terraced fields, limited mechanization, monsoon climate).
- Politely decline questions about medical, financial, political, legal, or unrelated topics and redirect the user to crop topics.
- If the user writes in Hindi, reply in Hindi. Otherwise reply in English.
- ALWAYS end every response with this exact line on its own paragraph:

_Disclaimer: This advice is AI-generated and should be verified with a licensed agricultural extension officer before implementation._`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const messages: UIMessage[] = body.messages ?? [];
    const threadId: string | undefined = body.threadId;
    if (!threadId) {
      return new Response(JSON.stringify({ error: "threadId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify thread belongs to this user
    const { data: thread } = await supabase
      .from("threads").select("id,title").eq("id", threadId).eq("user_id", user.id).maybeSingle();
    if (!thread) {
      return new Response(JSON.stringify({ error: "Thread not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Persist the latest user message
    const latest = messages[messages.length - 1];
    if (latest?.role === "user") {
      await supabase.from("messages").insert({
        thread_id: threadId, user_id: user.id, role: "user",
        parts: latest.parts as unknown as Record<string, unknown>,
        ai_message_id: latest.id ?? null,
      });

      // Auto-title on first user message
      if (thread.title === "New chat") {
        const firstText = (latest.parts as Array<{ type: string; text?: string }>)
          .filter((p) => p.type === "text").map((p) => p.text ?? "").join(" ").trim();
        const title = firstText.slice(0, 60) || "New chat";
        await supabase.from("threads").update({ title, updated_at: new Date().toISOString() }).eq("id", threadId);
      } else {
        await supabase.from("threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
      }
    }

    const gateway = createLovableAiGatewayProvider(key);
    const result = streamText({
      model: gateway("google/gemini-3-flash-preview"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      headers: corsHeaders,
      originalMessages: messages,
      onFinish: async ({ messages: finalMessages }) => {
        const assistant = finalMessages[finalMessages.length - 1];
        if (assistant?.role === "assistant") {
          await supabase.from("messages").insert({
            thread_id: threadId, user_id: user.id, role: "assistant",
            parts: assistant.parts as unknown as Record<string, unknown>,
            ai_message_id: assistant.id ?? null,
          });
        }
      },
    });
  } catch (err) {
    console.error("chat error", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});