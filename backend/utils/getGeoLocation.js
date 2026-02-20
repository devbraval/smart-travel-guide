async function getGeoLocation(name) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(name)}`,
    {
      headers: {
        "User-Agent": "smart-travel-app",
        "Accept": "application/json"
      }
    }
  );

  if (!res.ok) throw new Error("Nominatim failed");

  const data = await res.json();
  if (!data.length) throw new Error("Location not found");

  const place = data[0];

  return {
    lat: place.lat,
    lng: place.lon,
    boundingbox: place.boundingbox,
    display_name: place.display_name
  };
}

module.exports = { getGeoLocation };