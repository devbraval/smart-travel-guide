/* -------------------------------------------------------
   SMART PLACE FILTER + CATEGORIZER + RANKER
------------------------------------------------------- */


/* ---------- CATEGORY DETECTOR ---------- */
function detectCategory(tags = {}) {

  /* RELIGIOUS (highest priority) */
  if (
    tags.amenity === "place_of_worship" ||
    ["temple","mosque","church","shrine","synagogue"].includes(tags.building)
  )
    return "Religious Place";


  /* HOTEL (must come before tourism) */
  if (tags.tourism === "hotel" || tags.amenity === "hotel")
    return "Hotel";


  /* RESTAURANT */
  if (
    tags.amenity === "restaurant" ||
    tags.amenity === "cafe" ||
    tags.amenity === "fast_food"
  )
    return "Restaurant";


  /* PARK */
  if (tags.leisure === "park" || tags.leisure === "garden")
    return "Park";


  /* HISTORIC */
  if (tags.historic || tags.heritage)
    return "Monument";


  /* TOURISM (generic attractions last) */
  if (tags.tourism)
    return "Tourist Attraction";


  return null;
}



/* ---------- IMPORTANCE SCORE ---------- */
function scorePlace(tags = {}) {

  let score = 0;

  if (tags.wikidata) score += 5;
  if (tags.wikipedia) score += 5;
  if (tags.heritage) score += 4;
  if (tags.tourism) score += 3;
  if (tags.historic) score += 3;
  if (tags.amenity === "restaurant") score += 2;
  if (tags.amenity === "hotel") score += 2;
  if (tags.name?.length > 20) score += 1;

  return score;
}



/* ---------- FILTER + GROUP ---------- */
function filterAndShortlist(raw, limit = 400) {

  const groups = {};

  for (const place of raw) {

    const tags = place.tags || {};
    const name = tags.name;

    if (!name) continue;


    /* ---------- NOISE FILTER ---------- */
    const nameLower = name.toLowerCase();

    const bannedWords = [
      "road","circle","junction","chokdi","chowk","street",
      "hostel","block","quarter","society","colony",
      "transport","parking","tuition","office","service",
      "bypass","sector","plot","jn"
    ];

    if (bannedWords.some(w => nameLower.includes(w)))
      continue;


    /* remove generic buildings */
    if (tags.building && !tags.amenity && !tags.tourism && !tags.historic)
      continue;


    /* ---------- CATEGORY ---------- */
    const category = detectCategory(tags);
    if (!category) continue;


    /* ---------- SCORE ---------- */
    const score = scorePlace(tags);


    if (!groups[category])
      groups[category] = [];


    groups[category].push({
      name,
      lat: place.lat || place.center?.lat,
      lng: place.lon || place.center?.lon,
      score
    });
  }



  /* ---------- SORT + LIMIT ---------- */
  for (const cat in groups) {

    groups[cat] = groups[cat]
      .sort((a,b)=> b.score - a.score)
      .slice(0, limit);
  }

  return groups;
}



/* ---------- FINAL RANK ---------- */
async function rankplaces(grouped) {

  const result = {};

  for (const category in grouped) {

    const arr = grouped[category];
    if (!arr || !arr.length) continue;

    result[category] = arr.map(p => ({
      name: p.name,
      lat: p.lat,
      lng: p.lng
    }));
  }

  return result;
}



module.exports = {
  filterAndShortlist,
  rankplaces
};