function classifyPlace(types) {
  if (!types) return "Other";

  if (types.includes("restaurant") || types.includes("cafe")) return "Food";

  if (types.includes("park") || types.includes("beach")) return "Nature";

  if (types.includes("museum") || types.includes("art_gallery"))
    return "Culture";

  if (types.includes("shopping_mall") || types.includes("store"))
    return "Shopping";

  if (
    types.includes("temple") ||
    types.includes("church") ||
    types.includes("mosque")
  )
    return "Religious";

  if (types.includes("night_club") || types.includes("bar")) return "Nightlife";

  return "Entertainment";
}

module.exports = classifyPlace;
