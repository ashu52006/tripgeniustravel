import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { origin, destination, days, travelers, tripType, pace, startDate, destCurrency, homeCurrency, homeCurrencyCode } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Generate exactly 5 budget plans for: ${origin} to ${destination}, ${days} days, ${travelers} travelers, trip type: ${tripType}, pace: ${pace}, start: ${startDate}.
Destination currency: ${destCurrency}, Home currency: ${homeCurrency} (${homeCurrencyCode}).

Return ONLY valid JSON:
{"plans":[{"id":"plan-1","name":"Backpacker","level":1,"totalBudget":0,"totalBudgetHome":0,"description":"Short desc","highlights":["highlight"],"hotelType":"Hostel","foodType":"Street food","transportType":"Public transport"}]}

Plan names MUST be: Backpacker, Economy, Comfort, Premium, Luxury (levels 1-5).
Include flights, hotels, food, transport, activities. Use REAL 2024-2025 prices. Both currencies.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Travel budget AI. Return ONLY valid JSON, no markdown." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Try again." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "Failed to generate budget plans" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let plans;
    try {
      plans = JSON.parse(content);
    } catch {
      console.error("Parse error:", content.substring(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse budget plans. Try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify(plans), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("budget plans error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
