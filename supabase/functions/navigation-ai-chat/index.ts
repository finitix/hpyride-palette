import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Received messages:', messages);
    console.log('Navigation context:', context);

    const systemPrompt = `You are a friendly, fun AI travel companion for the HpyRide navigation app. You're riding along with the user on their journey.

Current journey context:
- Destination: ${context?.destination || 'Unknown'}
- ETA: ${context?.eta || 'Unknown'}
- Distance remaining: ${context?.distance || 'Unknown'}
- Current speed: Normal traffic

Your personality:
- Be cheerful, witty, and supportive
- Keep responses SHORT (1-2 sentences max)
- Use casual language and occasional emojis
- Make the journey fun and entertaining
- Offer quick facts, jokes, or encouragement
- Comment lightly on the journey progress

Example responses:
- "We're cruising! Only 10 minutes left ✨"
- "Wanna hear a quick fact while we drive?"
- "Traffic looks a bit tight ahead, but nothing we can't handle!"
- "Halfway there! You're doing great 🚗"

Never be distracting or provide complex information. Safety first!`;

    const geminiMessages = [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      {
        role: "model", 
        parts: [{ text: "Got it! I'm your friendly travel buddy. Let's make this journey fun! 🚗✨" }]
      },
      ...messages.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }))
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 100,
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response:', data);

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to help! 🚗";

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in navigation-ai-chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
