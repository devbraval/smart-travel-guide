function getCategory(tags = {}) {
  if (tags.tourism === "hotel" || tags.tourism === "resort" || tags.tourism === "guest_house") return "Hotel";
  if (tags.tourism === "museum") return "Museum";
  if (tags.tourism === "viewpoint") return "Viewpoint";
  if (tags.tourism === "attraction" || tags.tourism === "theme_park" || tags.tourism === "zoo") return "Tourist Attraction";

  if (tags.amenity === "restaurant") return "Restaurant";
  if (tags.amenity === "cafe") return "Cafe";
  if (tags.amenity === "place_of_worship") return "Religious Place";
  if (tags.amenity === "cinema") return "Cinema";
  if (tags.amenity === "fast_food") return "Fast Food";
  if (tags.amenity === "food_court") return "Food Court";
  if (tags.amenity === "bar" || tags.amenity === "pub" || tags.amenity === "nightclub") return "Nightlife";

  if (tags.natural === "beach") return "Beach";

  if (tags.shop === "mall") return "Mall";
  if (tags.shop === "supermarket" || tags.shop === "department_store") return "Super Market";
  if (tags.shop === "marketplace") return "Market";

  if (tags.leisure === "garden") return "Garden";
  if (tags.leisure === "park") return "Park";
  if (tags.natural === "water" || tags.natural === "lake") return "Water";

  if (tags.natural === "peak") return "Mountain";
  if (tags.leisure === "amusement_arcade") return "Game Zone";
  if (tags.leisure === "sports_centre" || tags.leisure === "stadium") return "Sports";

  if (tags.historic === "monument" || tags.historic === "memorial") return "Monument";

  if (tags.historic === "castle" || tags.historic === "fort") return "Fort";

  return "Other";
}

module.exports = { getCategory };
