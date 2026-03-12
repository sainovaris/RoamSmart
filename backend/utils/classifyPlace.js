module.exports = function classifyPlace(types = []) {
  if (types.includes("park") || types.includes("natural_feature"))
    return "Nature";

  if (
    types.includes("museum") ||
    types.includes("church") ||
    types.includes("hindu_temple") ||
    types.includes("mosque") ||
    types.includes("tourist_attraction")
  )
    return "Culture";

  if (
    types.includes("restaurant") ||
    types.includes("cafe") ||
    types.includes("food")
  )
    return "Food";

  if (types.includes("shopping_mall") || types.includes("store"))
    return "Shopping";

  return "Entertainment";
};
