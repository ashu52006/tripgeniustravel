import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query || query.length < 2) {
      return new Response(JSON.stringify({ suggestions: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Return ONLY a JSON array of city suggestions. Each item: {\"city\":\"City Name\",\"country\":\"Country\",\"type\":\"city|town|village|region\"}. Max 6 results. No markdown." },
          { role: "user", content: `Suggest cities/towns matching: "${query}"` },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      if (response.status === 429) return new Response(JSON.stringify({ suggestions: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ suggestions: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "[]";
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let suggestions;
    try {
      suggestions = JSON.parse(content);
    } catch {
      suggestions = [];
    }

    return new Response(JSON.stringify({ suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 6) : [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-cities error:", e);
    return new Response(JSON.stringify({ suggestions: [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
