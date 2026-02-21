
const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter"
];

const delay = ms => new Promise(r => setTimeout(r, ms));


/* ---------- FETCH ---------- */
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



/* ---------- MAIN FUNCTION ---------- */
async function getPlaceFromOverpass(boundingbox, centerLat, centerLng) {

  let [south, north, west, east] = boundingbox.map(Number);

  console.log("DISTRICT BBOX:", south, north, west, east);

  /* SAFE padding (small so districts don't merge) */
  const pad = 0.035;

  south -= pad;
  north += pad;
  west -= pad;
  east += pad;

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

  /* ---------- TILE FETCH ---------- */
  for (const [s, n, w, e] of tiles) {

    const box = `${s},${w},${n},${e}`;

    const query = `
[out:json][timeout:35];
(
  /* famous landmarks */
  nwr(${box})["wikidata"];
  nwr(${box})["wikipedia"];

  /* tourism */
  nwr(${box})["tourism"~"attraction|museum|viewpoint|theme_park|zoo|gallery"];

  /* monuments */
  nwr(${box})["historic"~"monument|castle|ruins|fort|memorial|archaeological_site"];
  nwr(${box})["heritage"];

  /* religious places */
  nwr(${box})["amenity"="place_of_worship"];
  nwr(${box})["building"="temple"];

  /* nature spots */
  nwr(${box})["natural"~"peak|water|rock|cave|spring|beach"];

  /* parks */
  nwr(${box})["leisure"="park"];

  /* SMART fallback — only named objects WITH tourism tag */
  nwr(${box})["tourism"]["name"];
);
out center tags;
`;

    const data = await fetchTile(query);
    console.log("Tile result:", data.length);

    results.push(...data);

    await delay(180);
  }



  /* ---------- OPTIONAL CENTER BOOST (FAMOUS NEAR CENTER ONLY) ---------- */
  if (centerLat && centerLng) {

    const radiusQuery = `
[out:json][timeout:25];
(
  nwr(around:12000,${centerLat},${centerLng})["wikidata"];
  nwr(around:12000,${centerLat},${centerLng})["tourism"="attraction"];
);
out center tags;
`;

    const near = await fetchTile(radiusQuery);
    results.push(...near);
  }



  /* ---------- REMOVE DUPLICATES ---------- */
  const map = new Map();
  for (const p of results)
    map.set(`${p.type}-${p.id}`, p);

  const finalResults = [...map.values()];

  console.log("TOTAL UNIQUE PLACES:", finalResults.length);

  return finalResults;
}

module.exports = { getPlaceFromOverpass };

