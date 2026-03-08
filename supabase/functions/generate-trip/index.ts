import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { origin, destination, days, travelers, userBudget, currency, homeCurrency, homeCurrencyCode, destCurrencySymbol, style, pace, startDate } = await req.json();

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const prompt = `You are an expert travel planner. Create a detailed ${days}-day trip itinerary for ${travelers} traveler(s) from ${origin} to ${destination}.

Travel style: ${style} | Pace: ${pace} | Start date: ${startDate}
User budget: ${homeCurrency || currency}${userBudget} (total for all travelers, all days)
Destination currency: ${currency}
Home currency: ${homeCurrency || currency} (${homeCurrencyCode || ''})

CRITICAL REQUIREMENTS:
1. Itinerary MUST start with flights from ${origin} to ${destination} on Day 1
2. Itinerary MUST end with return flights from ${destination} to ${origin} on the last day
3. Every place must include distance from previous place AND estimated taxi/auto fare
4. Show entry fees in BOTH destination currency (${currency}) and home currency (${homeCurrency || currency})
5. Include a Google Maps search URL for each place as "mapUrl"
6. Include an image search URL for each place as "imageUrl"

Return a JSON object with this EXACT structure (no markdown, no code blocks, just raw JSON):
{
  "days": [
    {
      "day": 1,
      "date": "${startDate}",
      "title": "Arrival in ${destination}",
      "places": [
        {
          "id": "d1p1",
          "name": "Flight: ${origin} to ${destination}",
          "description": "Depart from ${origin}",
          "whyRecommended": "Starting your journey",
          "startTime": "06:00",
          "endTime": "09:00",
          "entryFee": 0,
          "entryFeeHome": 0,
          "timeRequired": "3 hours",
          "distanceFromPrevious": "Starting point",
          "taxiFare": "${currency}0",
          "taxiFareHome": "${homeCurrency || currency}0",
          "crowdLevel": "medium",
          "weatherSuitability": "Any",
          "priority": "must-visit",
          "category": "flight",
          "imageUrl": "https://source.unsplash.com/400x300/?airport",
          "mapUrl": "https://www.google.com/maps/search/${destination}+airport"
        },
        {
          "id": "d1p2",
          "name": "Place Name",
          "description": "Brief description",
          "whyRecommended": "Why visit this place",
          "startTime": "10:00",
          "endTime": "12:00",
          "entryFee": 500,
          "entryFeeHome": 500,
          "timeRequired": "2 hours",
          "distanceFromPrevious": "15 km from airport",
          "taxiFare": "${currency}300",
          "taxiFareHome": "${homeCurrency || currency}300",
          "crowdLevel": "low",
          "weatherSuitability": "All weather",
          "priority": "must-visit",
          "category": "attraction",
          "imageUrl": "https://source.unsplash.com/400x300/?place+name",
          "mapUrl": "https://www.google.com/maps/search/place+name+${destination}"
        }
      ],
      "cost": {
        "transport": 500,
        "entryFees": 200,
        "food": 800,
        "activities": 300,
        "total": 1800,
        "totalHome": 1800
      }
    }
  ],
  "budget": {
    "userBudget": ${userBudget},
    "minimumBudget": 0,
    "comfortableBudget": 0,
    "idealBudget": 0,
    "currency": "${currency}",
    "homeCurrency": "${homeCurrency || currency}",
    "tips": ["tip1", "tip2", "tip3"],
    "breakdown": [
      { "category": "Accommodation", "userBudget": 0, "recommended": 0 },
      { "category": "Transport", "userBudget": 0, "recommended": 0 },
      { "category": "Food", "userBudget": 0, "recommended": 0 },
      { "category": "Activities", "userBudget": 0, "recommended": 0 },
      { "category": "Shopping", "userBudget": 0, "recommended": 0 }
    ]
  },
  "hotels": [
    {
      "id": "h1",
      "name": "Hotel Name",
      "pricePerNight": 2000,
      "pricePerNightHome": 2000,
      "distanceToAttractions": "1.5 km",
      "category": "budget",
      "safetyRating": 4,
      "guestRating": 4.2,
      "whyItFits": "Close to Day 1 attractions",
      "tag": "best-value"
    }
  ],
  "flights": [
    {
      "id": "f1",
      "airline": "Airline Name",
      "departureTime": "06:00",
      "arrivalTime": "09:00",
      "duration": "3h 00m",
      "price": 5000,
      "priceHome": 5000,
      "from": "${origin}",
      "to": "${destination}",
      "tag": "cheapest"
    }
  ],
  "returnFlights": [
    {
      "id": "rf1",
      "airline": "Airline Name",
      "departureTime": "18:00",
      "arrivalTime": "21:00",
      "duration": "3h 00m",
      "price": 5000,
      "priceHome": 5000,
      "from": "${destination}",
      "to": "${origin}",
      "tag": "cheapest"
    }
  ]
}

Rules:
- Use REAL place names, REAL restaurants, REAL hotels that exist in ${destination}
- All prices in destination currency (${currency}) with home currency (${homeCurrency || currency}) equivalents
- Include 5-7 places per day based on ${pace} pace
- CRITICAL: Each place must have distanceFromPrevious with REAL km distance AND taxiFare with estimated taxi/auto cost
- Places should be CONNECTED — ordered by proximity so travel between them is efficient
- Day 1 starts with arrival flight, last day ends with departure flight
- Provide 3 outbound flights (${origin} to ${destination}) and 3 return flights (${destination} to ${origin})
- Provide 3 hotels near the main attractions
- Total trip cost should be WITHIN the user budget of ${homeCurrency || currency}${userBudget}
- Each place should have a Google Maps search URL as mapUrl
- Use Unsplash image URLs for imageUrl (https://source.unsplash.com/400x300/?search+terms)`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a travel planning AI. Return ONLY valid JSON, no markdown formatting, no code blocks." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 8000,
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
