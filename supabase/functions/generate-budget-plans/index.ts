import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { origin, destination, days, travelers, style, pace, startDate, destCurrency, homeCurrency, homeCurrencyCode } = await req.json();

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const prompt = `You are a travel budget expert with deep knowledge of REAL travel costs. Generate exactly 10 budget plan options for a trip.

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
      "transportType": "Public transport only",
      "imageKeyword": "hostel backpacker travel"
    }
  ]
}

CRITICAL PRICING RULES:
- Generate exactly 10 plans from cheapest (level 1) to most expensive (level 10)
- Plan names: Backpacker, Budget, Economy, Standard, Comfort, Premium, Deluxe, Luxury, Ultra Luxury, Royal
- totalBudget is in ${destCurrency}, totalBudgetHome is in ${homeCurrency}
- All budgets must be TOTAL for ${travelers} travelers over ${days} days
- MUST include round-trip international flights (${origin} to ${destination} and back) — research REAL current airfare prices. For example, India to USA round trip economy is ₹60,000-₹1,50,000 per person, India to Europe is ₹40,000-₹1,00,000 per person.
- MUST include hotels/accommodation for ALL ${days} nights
- MUST include food (3 meals/day), local transport, activities, visa fees if applicable
- Use REALISTIC 2024-2025 prices — do NOT underestimate. Cross-check: a budget trip from India to USA for 1 person for 15 days costs at MINIMUM ₹2,50,000-₹3,00,000 total.
- Each plan should be meaningfully different in quality and cost
- The cheapest plan should still be REALISTIC (not impossibly cheap)
- Budget should roughly 3-4x from plan 1 to plan 10 for international trips
- For domestic trips, budget should roughly 2-3x from plan 1 to plan 10
- imageKeyword: 2-3 words describing the travel style for that tier`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a travel budget AI. Return ONLY valid JSON, no markdown formatting." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
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
