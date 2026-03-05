import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { destination, days, travelers, userBudget, currency, style, pace, startDate } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are an expert travel planner. Create a detailed ${days}-day trip itinerary for ${travelers} traveler(s) to ${destination}.

Travel style: ${style} | Pace: ${pace} | Start date: ${startDate}
User budget: ${currency}${userBudget} (total for all travelers, all days)

IMPORTANT: Plan the trip to FIT WITHIN the user's budget of ${currency}${userBudget}. Optimize costs to stay within budget while maximizing experience.

Return a JSON object with this EXACT structure (no markdown, no code blocks, just raw JSON):
{
  "days": [
    {
      "day": 1,
      "date": "${startDate}",
      "title": "Arrival & First Impressions",
      "places": [
        {
          "id": "d1p1",
          "name": "Place Name",
          "description": "Brief description",
          "whyRecommended": "Why visit this place",
          "startTime": "09:00",
          "endTime": "11:00",
          "entryFee": 0,
          "timeRequired": "2 hours",
          "distanceFromPrevious": "Start point",
          "crowdLevel": "low",
          "weatherSuitability": "All weather",
          "priority": "must-visit",
          "category": "attraction"
        }
      ],
      "cost": {
        "transport": 500,
        "entryFees": 200,
        "food": 800,
        "activities": 300,
        "total": 1800
      }
    }
  ],
  "budget": {
    "userBudget": ${userBudget},
    "minimumBudget": 0,
    "comfortableBudget": 0,
    "idealBudget": 0,
    "currency": "${currency}",
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
      "tag": "cheapest"
    }
  ]
}

Rules:
- Use REAL place names, REAL restaurants, REAL hotels that exist in ${destination}
- All prices must be in ${currency} and be REALISTIC current prices
- Include 5-7 places per day based on ${pace} pace
- Each day should have breakfast, lunch, dinner spots plus attractions
- Priority must be: "must-visit", "recommended", or "optional"
- Category must be: "attraction", "food", "transport", "rest", "activity", or "viewpoint"
- crowdLevel must be: "low", "medium", or "high"
- Hotel categories: "budget", "comfort", or "premium"
- Flight tags: "cheapest", "balanced", or "fastest"
- Hotel tags: "best-value", "budget-saver", or "comfort-pick"
- The total trip cost should be WITHIN or close to the user's budget of ${currency}${userBudget}
- Provide 3 hotels and 3 flight options
- Budget breakdown should show realistic allocation
- minimumBudget < comfortableBudget < idealBudget
- Tips should be practical money-saving advice for ${destination}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a travel planning AI. Return ONLY valid JSON, no markdown formatting, no code blocks." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Failed to generate trip plan" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Strip markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let tripPlan;
    try {
      tripPlan = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse trip plan. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(tripPlan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-trip error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
