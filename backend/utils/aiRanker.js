function normalize(str) {
    return str.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

async function aiRankCategory(category, places, limit = 20) {

    if (!places || !places.length) return [];

    const candidates = places.slice(0, 40);

    const list = candidates.map((p, i) =>
        `${i + 1}. ${p.name}`
    ).join("\n");

    const prompt = `
Select top ${limit} famous ${category} places.
Return only names list.

${list}
`;

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 15000);

    const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3
            }),
            signal: controller.signal
        }
    );

    if (!res.ok) {
        const t = await res.text();
        console.log("AI ERROR:", t);
        throw new Error("AI failed");
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";

    const selected = text
        .split("\n")
        .map(x => x.replace(/^\d+[\).\s-]*/, "").trim())
        .filter(Boolean);

    const set = new Set(selected.map(x => normalize(x)));

    return candidates.filter(p =>
        set.has(normalize(p.name))
    );
}



async function rankplaces(grouped) {

    const entries = Object.entries(grouped);

    const ranked = await Promise.all(
        entries.map(async ([cat, places]) => {
            try {
                const r = await aiRankCategory(cat, places);
                return [cat, r.length ? r : places.slice(0, 20)];
            } catch {
                console.log("AI failed → fallback ranking:", cat);
                return [cat, places.slice(0, 20)];
            }
        })
    );

    return Object.fromEntries(ranked);
}

module.exports = { rankplaces };