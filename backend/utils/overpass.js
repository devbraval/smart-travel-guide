const OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.openstreetmap.ru/api/interpreter"
];

async function runOverpass(lat, lng, radius = 3000) {
    const query = `
  [out:json][timeout:20];
  (
    node(around:${radius},${lat},${lng})[amenity];
    way(around:${radius},${lat},${lng})[amenity];

    node(around:${radius},${lat},${lng})[shop];
    way(around:${radius},${lat},${lng})[shop];

    node(around:${radius},${lat},${lng})[leisure];
    way(around:${radius},${lat},${lng})[leisure];

    node(around:${radius},${lat},${lng})[tourism];
    way(around:${radius},${lat},${lng})[tourism];

    node(around:${radius},${lat},${lng})[natural];
    way(around:${radius},${lat},${lng})[natural];

    node(around:${radius},${lat},${lng})[historic];
    way(around:${radius},${lat},${lng})[historic];
  );
  out center;
  `;

    for (const url of OVERPASS_URLS) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15_000);

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: query,
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) throw new Error("Overpass not OK");

            const data = await response.json();

            return (data.elements || [])
                .filter(e => e.tags?.name)
                .map(e => ({
                    name: e.tags.name,
                    tags: e.tags,
                    lat: e.lat ?? e.center?.lat,
                    lng: e.lon ?? e.center?.lon,
                    osmType: e.type
                }));

        } catch (err) {
            console.warn(`Overpass failed on ${url}, trying next...`);
        }
    }
    return [];
}

module.exports = { runOverpass };