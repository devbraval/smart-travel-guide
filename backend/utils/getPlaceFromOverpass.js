const ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
];

const delay = ms => new Promise(r => setTimeout(r, ms));

async function fetchTile(query) {
    for (const url of ENDPOINTS) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 25000);

            const res = await fetch(url, {
                method: "POST",
                body: query,
                headers: { "Content-Type": "text/plain" },
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!res.ok) continue;

            const json = await res.json();
            return json.elements || [];
        } catch { }
    }
    return [];
}

async function getPlaceFromOverpass(boundingbox) {

    const [south, north, west, east] = boundingbox.map(Number);

    const latStep = (north - south) / 2;
    const lonStep = (east - west) / 2;

    const tiles = [];

    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            tiles.push([
                south + i * latStep,
                south + (i + 1) * latStep,
                west + j * lonStep,
                west + (j + 1) * lonStep
            ]);
        }
    }

    let results = [];

    for (const [s, n, w, e] of tiles) {

        const box = `${s},${w},${n},${e}`;

        const query = `
[out:json][timeout:60];
(
 node["tourism"](${box});
 node["amenity"](${box});
 node["leisure"](${box});
 node["historic"](${box});
 node["tourism"="attraction"](${box});

 way["tourism"](${box});
 way["amenity"](${box});
 way["leisure"](${box});
 way["historic"](${box});
 way["tourism"="attraction"](${box});
);
out center;
`;

        const data = await fetchTile(query);
        results.push(...data);
        await delay(300);
    }

    // remove duplicates
    const map = new Map();
    results.forEach(p => map.set(p.id, p));

    return [...map.values()];
}

module.exports = { getPlaceFromOverpass };
