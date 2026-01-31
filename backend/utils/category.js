function getCategory(tags = {}) {
  if (tags.tourism === "hotel") return "Hotel";
  if (tags.amenity === "restaurant") return "Restaurant";
  if (tags.amenity === "cafe") return "Cafe";
  if (tags.amenity === "place_of_worship") return "Religious Place";
  if (tags.amenity === "cinema") return "Cinema";
  if (tags.amenity === "fast_food") return "Fast Food";
  if (tags.amenity === "food_court") return "Food Court";

  if (tags.natural === "beach") return "Beach";
  if (tags.natural === "water") return "Water";

  if (tags.shop === "mall") return "Mall";
  if (tags.shop === "supermarket") return "Super Market";

  if (tags.leisure === "garden") return "Garden";
  if (tags.leisure === "park") return "Park";
  if (tags.leisure === "amusement_arcade") return "Game Zone"; 

  return "Other";
}

module.exports = { getCategory };
