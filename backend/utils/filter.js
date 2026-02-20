function getCategory(tags) {

    // Aggressive fallback: if name contains "Hostel" or "Hotel", force category
    const name = tags.name ? tags.name.toLowerCase() : "";
    if (name.includes("hostel") || name.includes("hotel") || name.includes("guest house")) return "Hotel";

    const t = tags.tourism;
    if (["hotel", "hostel", "guest_house", "motel"].includes(t)) return "Hotel";
    if (["museum", "art_gallery"].includes(t)) return "Museum";
    if (["theme_park", "zoo", "aquarium", "attraction"].includes(t)) return "Attraction";
    if (t === "viewpoint") return "Viewpoint";

    if (tags.amenity === "restaurant") return "Restaurant";
    if (tags.amenity === "fast_food") return "Fast Food";
    if (tags.amenity === "cafe") return "Cafe";
    if (tags.amenity === "place_of_worship") return "Temple";

    if (t) return "Tourist Place";

    if (tags.leisure === "park" || tags.leisure === "garden") return "Park";
    if (tags.historic) return "Monument";

    return "Other";
}

function filterPlaces(elements) {

    const out = {};

    for (const el of elements) {

        const tags = el.tags || {};
        if (!tags.name) continue;

        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;

        if (!lat || !lng) continue;

        const cat = getCategory(tags);
        if (cat === "Other") continue;

        if (!out[cat]) out[cat] = [];

        out[cat].push({
            id: el.id,
            name: tags.name,
            lat,
            lng
        });
    }

    return out;
}

module.exports = { filterPlaces };
