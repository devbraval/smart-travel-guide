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
    } catch {}
  }
  return [];
}


async function getPlaceFromOverpass(boundingbox, centerLat, centerLng) {

  let [south, north, west, east] = boundingbox.map(Number);

  /* expand bbox so border attractions are included */
  const pad = 0.25;
  south -= pad;
  north += pad;
  west -= pad;
  east += pad;

  /* split into tiles for reliability */
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
[out:json][timeout:40];
(
  nwr(${box})["tourism"];
  nwr(${box})["historic"];
  nwr(${box})["heritage"];
  nwr(${box})["leisure"="park"];
  nwr(${box})["amenity"="place_of_worship"];

  /* important places */
  nwr(${box})["wikidata"];

  /* nearby attractions */
  nwr(around:40000,${centerLat},${centerLng})["tourism"];

  /* fallback: any named place */
  nwr(${box})["name"];
);
out center tags;
`;
    const data = await fetchTile(query);
    results.push(...data);

    await delay(250);
  }

  /* remove duplicates */
  const map = new Map();
  for (const p of results)
    map.set(`${p.type}-${p.id}`, p);

  return [...map.values()];
}

module.exports = { getPlaceFromOverpass };