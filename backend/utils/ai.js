const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const { getCategory } = require("./category");

async function processWithAi(places) {
    console.log("AI CHECK → key:", !!process.env.GROQ_API_KEY, "places:", places?.length);

    if (!process.env.GROQ_API_KEY || !Array.isArray(places) || places.length <= 10) {
        return places.map(p => p.name);
    }

    const simplified = places.slice(0, 50).map(p => ({
        name: p.name,
        category: getCategory(p.tags)
    }));

    const prompt = `
You are a travel assistant.

From the following places, select the best places for a visitor.

Constraints:
1. Select AT LEAST 1 place per category if available in the data.
2. Select MAXIMUM 8 places per category.
3. Do NOT be too strict—include local spots, canteens, and small shops if needed to meet the minimum.

Group them by category using ONLY the provided categories.

Return ONLY valid JSON:
{
  "categories": {
    "Restaurant": ["Place name"],
    "Park": ["Place name"]
  }
}

Data:
${JSON.stringify(simplified)}
`;

    try {
        const response = await fetch(GROQ_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3,
                max_tokens: 300
            })
        });

        const raw = await response.text();
        console.log("GROQ RAW RESPONSE:", raw);

        if (!response.ok) throw new Error(raw);

        const json = JSON.parse(raw);
        const aiText = json.choices?.[0]?.message?.content;

        const match = aiText?.match(/\{[\s\S]*\}/);
        if (!match) return places.slice(0, 20).map(p => p.name);

        const aiResult = JSON.parse(match[0]);
        const names = Object.values(aiResult.categories || {}).flat();

        return names.length ? names : places.slice(0, 20).map(p => p.name);

    } catch (err) {
        console.error("Groq AI failed:", err.message);
        return places.slice(0, 20).map(p => p.name);
    }
}

module.exports = { processWithAi };