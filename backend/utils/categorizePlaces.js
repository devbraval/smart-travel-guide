const { getCategory } = require("../utils/category");

function categorizePlaces(places, selectedNames) {
  const result = {};

  for (const place of places) {
    if (!selectedNames.includes(place.name)) continue;

    const category = getCategory(place.tags);

    if (!result[category]) result[category] = [];
    if (result[category].length < 10) {
      result[category].push(place);
    }
  }

  return result;
}

module.exports = { categorizePlaces };
