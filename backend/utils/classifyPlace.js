const categoryMap = {
  Culture: {
    Monument: ["tourist_attraction", "monument", "historical_landmark"],
    Museum: ["museum"],
    Temple: ["hindu_temple", "place_of_worship"],
    Church: ["church"],
    Mosque: ["mosque"],
  },

  Food: {
    Restaurant: ["restaurant"],
    Cafe: ["cafe"],
    StreetFood: ["food", "meal_takeaway"],
    Bakery: ["bakery"],
  },

  Nature: {
    Park: ["park"],
    Garden: ["garden"],
    Lake: ["lake"],
    Beach: ["beach"],
  },

  Entertainment: {
    Mall: ["shopping_mall"],
    Movie: ["movie_theater"],
    Amusement: ["amusement_park"],
  },

  Stay: {
    Hotel: ["lodging"],
    Resort: ["resort"],
  },
};

const classifyPlace = (types = []) => {
  for (const category in categoryMap) {
    for (const subcategory in categoryMap[category]) {
      const keywords = categoryMap[category][subcategory];

      if (types.some((type) => keywords.includes(type))) {
        return {
          category,
          subcategory,
        };
      }
    }
  }

  return {
    category: "Other",
    subcategory: "General",
  };
};

module.exports = classifyPlace;
