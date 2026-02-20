const { getCategory } = require("./category");

/* ❌ BLOCK unwanted places */
function isBlocked(tags = {}) {

  if (tags.amenity === "hospital") return true;
  if (tags.amenity === "clinic") return true;
  if (tags.amenity === "bank") return true;
  if (tags.amenity === "school") return true;
  if (tags.amenity === "college") return true;
  if (tags.tourism === "hostel") return true;
  if (tags.building === "dormitory") return true;

  return false;
}


/* ✅ allow only travel-relevant places */
function isUseful(tags = {}) {

  if (tags.tourism) return true;
  if (tags.historic) return true;
  if (tags.heritage) return true;
  if (tags.monument) return true;
  if (tags.ruins) return true;
  if (tags.leisure === "park") return true;

  const a = tags.amenity;

  return (
    a === "restaurant" ||
    a === "cafe" ||
    a === "fast_food" ||
    a === "place_of_worship" ||
    a === "hotel"
  );
}


/* ⭐ scoring engine */
function score(tags = {}) {
  let s = 0;

  /* tourist importance */
  if (tags.tourism) s += 60;
  if (tags.tourism === "attraction") s += 80;
  if (tags.tourism === "theme_park") s += 90;

  if (tags.historic) s += 70;
  if (tags.heritage) s += 65;
  if (tags.leisure === "park") s += 50;

  /* famous indicators */
  if (tags.wikipedia) s += 100;
  if (tags.wikidata) s += 100;

  /* quality indicators */
  if (tags.image) s += 15;
  if (tags.website) s += 10;

  /* minor */
  s += Object.keys(tags).length / 5;

  return s;
}


function normalize(el) {

  const tags = el.tags || {};
  if (!tags.name) return null;

  if (isBlocked(tags)) return null;
  if (!isUseful(tags)) return null;

  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;

  if (lat == null || lng == null) return null;

  let category = getCategory(tags);
  if (!category || category === "Other")
    category = "Attraction";

  return {
    id: `${el.type}-${el.id}`,
    name: tags.name,
    lat,
    lng,
    category,
    score: score(tags),
    tags
  };
}


/* remove duplicates */
function dedupe(list) {

  const out = [];

  for (const p of list) {
    const dup = out.find(q =>
      q.name.toLowerCase() === p.name.toLowerCase() &&
      Math.abs(q.lat - p.lat) < 0.001 &&
      Math.abs(q.lng - p.lng) < 0.001
    );
    if (!dup) out.push(p);
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

  for (const cat in grouped) {
    grouped[cat] = grouped[cat]
      .sort((a,b)=>b.score-a.score)
      .slice(0, limit);
  }

  return grouped;
}

module.exports = { filterAndShortlist };