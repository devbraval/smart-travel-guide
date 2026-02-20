function normalize(str) {
  return str.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

async function rankplaces(groups) {

  const categories = Object.entries(groups)
    .map(([cat, places]) =>
      `### ${cat}\n` +
      places.slice(0, 40).map(p => p.name).join("\n")
    ).join("\n\n");

  const prompt = `
Select the most famous and important places from each category.

Return format EXACTLY:
Category: place1, place2, place3

${categories}
`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      })
    });

    if (!res.ok) throw new Error();

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";

    const result = {};

    text.split("\n").forEach(line => {
      const [cat, rest] = line.split(":");
      if (!rest) return;

      const names = rest.split(",").map(s => normalize(s));
      const original = groups[cat.trim()] || [];

      result[cat.trim()] = original.filter(p =>
        names.includes(normalize(p.name))
      );
    });

    return Object.keys(result).length ? result : groups;

  } catch {
    console.log("AI unavailable → fallback ranking");
    return groups;
  }
}

module.exports = { rankplaces };