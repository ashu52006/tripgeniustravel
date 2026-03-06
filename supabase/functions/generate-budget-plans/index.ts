import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { origin, destination, days, travelers, style, pace, startDate, destCurrency, homeCurrency, homeCurrencyCode } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a travel budget expert. Generate exactly 10 budget plan options for a trip.

Trip: ${origin} to ${destination}, ${days} days, ${travelers} travelers
Style: ${style} | Pace: ${pace} | Start: ${startDate}
Destination currency: ${destCurrency}
Home currency: ${homeCurrency} (${homeCurrencyCode})

Return a JSON object with this EXACT structure (no markdown, no code blocks, raw JSON only):
{
  "plans": [
    {
      "id": "plan-1",
      "name": "Backpacker",
      "level": 1,
      "totalBudget": 15000,
      "totalBudgetHome": 15000,
      "description": "Hostels, street food, public transport",
      "highlights": ["Budget friendly", "Local experience"],
      "hotelType": "Hostel/Dormitory",
      "foodType": "Street food & local joints",
      "transportType": "Public transport only"
    }
  ]
}

Rules:
- Generate exactly 10 plans from cheapest (level 1) to most expensive (level 10)
- Plan names: Backpacker, Budget, Economy, Standard, Comfort, Premium, Deluxe, Luxury, Ultra Luxury, Royal
- totalBudget is in ${destCurrency}, totalBudgetHome is in ${homeCurrency}
- All budgets must be TOTAL for ${travelers} travelers over ${days} days
- Include flights (${origin} to ${destination} and back), hotels, food, transport, activities
- Use REALISTIC current prices for ${destination}
- Each plan should be meaningfully different (not just +10%)
- Budget should roughly double from plan 1 to plan 10`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a travel budget AI. Return ONLY valid JSON, no markdown formatting." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
