import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Real-world price benchmarks (2025). These anchor the model so budgets match
 * what travellers actually pay instead of being invented.
 */
const PRICE_BENCHMARKS = `
REAL 2025 PRICE BENCHMARKS — anchor every number to these, per person unless stated.

ROUND-TRIP ECONOMY FLIGHTS (from India, INR):
- Domestic India: 6,000-14,000
- India to UAE/Gulf: 18,000-35,000
- India to SE Asia (Thailand, Vietnam, Bali, Singapore): 25,000-55,000
- India to Europe (UK, France, Germany, Italy): 55,000-1,10,000
- India to USA/Canada: 75,000-1,60,000 (peak Jun-Aug & Dec: up to 2,00,000)
- India to Australia/NZ: 70,000-1,30,000
- India to Japan/Korea: 45,000-85,000
Business class = 3x economy. Add 15-30% in peak season and for <21-day booking.

HOTEL PER NIGHT (per room, local currency equivalent in INR):
- India budget 800-2,000 | mid 3,000-7,000 | luxury 12,000-40,000
- SE Asia budget 1,200-2,500 | mid 4,000-9,000 | luxury 15,000-50,000
- Europe budget 4,500-8,000 | mid 10,000-18,000 | luxury 25,000-70,000
- USA budget 7,000-11,000 | mid 13,000-22,000 | luxury 30,000-90,000

FOOD PER PERSON PER DAY (INR): India 400-2,500 | SE Asia 800-3,000 | Europe 2,500-7,000 | USA 3,000-8,000
LOCAL TRANSPORT PER DAY (INR): India 300-1,500 | SE Asia 500-2,000 | Europe 1,200-3,500 | USA 1,500-4,500
ACTIVITIES/ATTRACTIONS PER DAY (INR): 500-3,000 budget, 3,000-8,000 premium
VISA + INSURANCE: Schengen ~12,000 | USA ~16,000 | UK ~16,000 | SE Asia e-visa 2,000-4,000 | insurance 1,500-6,000
`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { origin, destination, days, travelers, tripType, pace, startDate, destCurrency, homeCurrency, homeCurrencyCode } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Generate exactly 5 budget plans for a REAL trip: ${origin} to ${destination}, ${days} days, ${travelers} travelers, trip type: ${tripType}, pace: ${pace}, start date: ${startDate}.
Destination currency: ${destCurrency}. Home currency: ${homeCurrency} (${homeCurrencyCode}).

${PRICE_BENCHMARKS}

RULES:
1. totalBudget/totalBudgetHome are for ALL ${travelers} traveller(s) for the FULL ${days} days — flights + hotels (${days - 1 > 0 ? days - 1 : 1} nights) + food + local transport + activities + visa/insurance.
2. Give a truthful per-category breakdown. The breakdown MUST sum to the total.
3. Never output a total lower than the round-trip flight cost for ${travelers} traveller(s).
4. Reflect the ${startDate} season and route distance in the flight price.

Return ONLY valid JSON:
{"plans":[{"id":"plan-1","name":"Backpacker","level":1,"totalBudget":0,"totalBudgetHome":0,"perPersonHome":0,"perDayHome":0,"breakdown":{"flights":0,"stay":0,"food":0,"localTransport":0,"activities":0,"visaInsurance":0,"misc":0},"description":"Short desc","highlights":["highlight"],"hotelType":"Hostel","foodType":"Street food","transportType":"Public transport"}]}

breakdown values are in ${homeCurrencyCode} for all travellers combined.
Plan names MUST be exactly: Backpacker, Economy, Comfort, Premium, Luxury (levels 1-5).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You are a travel pricing analyst. You quote real market prices and never invent unrealistically low totals. Return ONLY valid JSON, no markdown." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 4000,
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

    // Derive per-person / per-day figures if the model omitted them.
    if (Array.isArray(plans?.plans)) {
      for (const p of plans.plans) {
        const total = Number(p.totalBudgetHome || p.totalBudget || 0);
        if (!p.perPersonHome && travelers > 0) p.perPersonHome = Math.round(total / travelers);
        if (!p.perDayHome && days > 0) p.perDayHome = Math.round(total / days);
      }
    }

    return new Response(JSON.stringify(plans), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("budget plans error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
