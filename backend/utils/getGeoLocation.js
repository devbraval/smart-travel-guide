async function getGeoLocation(DISTRICT_NAME) {
    const respose = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(DISTRICT_NAME)}
`, {
        headers: {
            "User-Agent": "smart-travel-app",
            "Accept": "application/json"
        }
    });
    if (!respose.ok) {
        throw new Error("Nominatim api fails");
    }
    const data = await respose.json();
    if (!data.length) {
        throw new Error("District not found");
    }
    const place = data[0];

    return {
        lat: place.lat,
        lng: place.lon,
        osm_id: place.osm_id,
        osm_type: place.osm_type,
        boundingbox: place.boundingbox,
        display_name: place.display_name,
    };
}
module.exports = { getGeoLocation };