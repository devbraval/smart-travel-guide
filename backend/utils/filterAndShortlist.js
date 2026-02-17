const { getCategory } = require("./category");

function score(tags = {}) {

    let s = 0;

    if (tags.wikipedia) s += 5;
    if (tags.website) s += 4;
    if (tags.tourism) s += 4;
    if (tags.historic) s += 4;
    if (tags.image) s += 3;
    if (tags.brand || tags.operator) s += 2;

    if (tags["addr:street"] || tags["addr:city"])
        s += 2;

    s += Object.keys(tags).length / 2;

    return s;
}



function normalize(el) {

    const tags = el.tags || {};
    if (!tags.name) return null;

    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;

    if (lat == null || lng == null) return null;

    const category = getCategory(tags);
    if (category === "Other") return null;

    return {
        id: el.id,
        name: tags.name,
        lat,
        lng,
        category,
        score: score(tags),
        tags
    };
}



function dedupe(list) {

    const out = [];

    for (const place of list) {

        const dup = out.find(q =>
            q.name.toLowerCase() === place.name.toLowerCase() &&
            Math.abs(q.lat - place.lat) < 0.001 &&
            Math.abs(q.lng - place.lng) < 0.001
        );

        if (!dup) out.push(place);
    }

    return out;
}



function filterAndShortlist(elements, limit = 200) {

    const clean = elements.map(normalize).filter(Boolean);
    const unique = dedupe(clean);

    const grouped = {};

    for (const place of unique) {
        if (!grouped[place.category])
            grouped[place.category] = [];

        grouped[place.category].push(place);
    }

    for (const category in grouped) {
        grouped[category] = grouped[category]
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    return grouped;
}

module.exports = { filterAndShortlist };
