async function getGeoLocation(name) {

    const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(name + ", India")}`,
        {
            headers: {
                "User-Agent": "smart-travel-app",
                "Accept": "application/json"
            }
        }
    );

    if (!res.ok) throw new Error("Geocoder failed");

    const data = await res.json();
    if (!data.length) throw new Error("Location not found");

    // find district-level result
    const district =
        data.find(p =>
            p.type === "administrative" ||
            p.type === "boundary" ||
            p.class === "boundary"
        ) || data[0];

    return {
        lat: district.lat,
        lng: district.lon,
        boundingbox: district.boundingbox,
        display_name: district.display_name
    };
}

module.exports = { getGeoLocation };
