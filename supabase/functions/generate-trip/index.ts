import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { origin, destination, days, travelers, userBudget, currency, homeCurrency, homeCurrencyCode, destCurrencySymbol, style, pace, startDate } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const placesPerDay = pace === "relaxed" ? 2 : pace === "packed" ? 4 : 3;

    const prompt = `Create a ${days}-day trip from ${origin} to ${destination} for ${travelers} travelers. Budget: ${homeCurrency}${userBudget}. Start: ${startDate}. Style: ${style}. Currency: ${currency}, home: ${homeCurrency}(${homeCurrencyCode}).

Return ONLY valid JSON:
{"days":[{"day":1,"date":"YYYY-MM-DD","title":"Day title","places":[{"id":"d1p1","name":"Place","description":"Brief desc","whyRecommended":"Why","startTime":"09:00","endTime":"11:00","entryFee":0,"entryFeeHome":0,"timeRequired":"2h","distanceFromPrevious":"5km","taxiFare":"${currency}100","taxiFareHome":"${homeCurrency}100","crowdLevel":"medium","weatherSuitability":"All","priority":"must-visit","category":"attraction","imageUrl":"https://source.unsplash.com/400x300/?place","mapUrl":"https://www.google.com/maps/search/place+${destination}"}],"cost":{"transport":0,"entryFees":0,"food":0,"activities":0,"total":0,"totalHome":0}}],"budget":{"userBudget":${userBudget},"minimumBudget":0,"comfortableBudget":0,"idealBudget":0,"currency":"${currency}","homeCurrency":"${homeCurrency}","tips":["tip1"],"breakdown":[{"category":"Accommodation","userBudget":0,"recommended":0},{"category":"Transport","userBudget":0,"recommended":0},{"category":"Food","userBudget":0,"recommended":0},{"category":"Activities","userBudget":0,"recommended":0},{"category":"Shopping","userBudget":0,"recommended":0}]},"hotels":[{"id":"h1","name":"Hotel","pricePerNight":0,"pricePerNightHome":0,"distanceToAttractions":"1km","category":"budget","safetyRating":4,"guestRating":4.2,"whyItFits":"Reason","tag":"best-value"}],"flights":[{"id":"f1","airline":"Airline","departureTime":"06:00","arrivalTime":"09:00","duration":"3h","price":0,"priceHome":0,"from":"${origin}","to":"${destination}","tag":"cheapest"}],"returnFlights":[{"id":"rf1","airline":"Airline","departureTime":"18:00","arrivalTime":"21:00","duration":"3h","price":0,"priceHome":0,"from":"${destination}","to":"${origin}","tag":"cheapest"}]}

Rules: Use REAL places/hotels/restaurants. Day 1=arrival flight, last day=return flight. ${placesPerDay} places/day. Connected by proximity. Prices in both currencies. 3 flights each way, 3 hotels. Stay within budget.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Travel planner. Return ONLY valid JSON, no markdown." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 12000,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "Failed to generate trip plan" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let tripPlan;
    try {
      tripPlan = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse trip plan. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify(tripPlan), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-trip error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
