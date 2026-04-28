const categoryMap = {
  Food: {
    Restaurant: ["restaurant", "food"],
    Cafe: [
      "cafe",
      "coffee_shop",
      "tea_house",
      "juice_bar",
      "dessert_shop",
      "ice_cream_shop",
    ],
    StreetFood: ["meal_takeaway", "meal_delivery", "fast_food_restaurant"],
    Bakery: ["bakery", "confectionery"],
    Bar: ["bar", "pub", "wine_bar", "cocktail_bar", "night_club", "brewery"],
  },

  Entertainment: {
    Mall: ["shopping_mall", "department_store", "market", "shopping_center"],
    Movie: ["movie_theater", "cinema", "drive_in_movie_theater"],
    Amusement: [
      "amusement_park",
      "water_park",
      "theme_park",
      "adventure_sports",
    ],
    NightLife: [
      "night_club",
      "comedy_club",
      "jazz_club",
      "karaoke",
      "casino",
      "bowling_alley",
    ],
    Sports: [
      "stadium",
      "sports_complex",
      "cricket_ground",
      "football_stadium",
      "golf_course",
      "race_track",
    ],
    Gaming: ["arcade", "escape_room", "laser_tag", "go_kart_track"],
    Events: [
      "concert_hall",
      "event_venue",
      "convention_center",
      "amphitheater",
      "fairground",
    ],
  },

  Culture: {
    Monument: [
      "tourist_attraction",
      "monument",
      "historical_landmark",
      "heritage_site",
      "war_memorial",
    ],
    Museum: [
      "museum",
      "art_gallery",
      "exhibition_center",
      "science_museum",
      "history_museum",
    ],
    Temple: [
      "hindu_temple",
      "place_of_worship",
      "ashram",
      "shrine",
      "pilgrimage_site",
    ],
    Church: ["church", "cathedral", "chapel"],
    Mosque: ["mosque", "islamic_center"],
    Other: ["synagogue", "gurudwara", "buddhist_temple", "jain_temple"],
  },

  Nature: {
    Park: [
      "park",
      "national_park",
      "nature_reserve",
      "botanical_garden",
      "wildlife_sanctuary",
    ],
    Garden: ["garden", "arboretum", "flower_garden", "sculpture_garden"],
    Lake: ["lake", "reservoir", "river", "waterfall", "dam"],
    Beach: ["beach", "beach_resort", "coastal_area", "bay"],
    Viewpoint: ["viewpoint", "observation_deck", "scenic_point", "hilltop"],
    Adventure: [
      "hiking_area",
      "trekking_trail",
      "campground",
      "forest",
      "cave",
    ],
  },

  Stay: {
    Hotel: ["lodging", "hotel", "motel", "inn", "guest_house"],
    Resort: ["resort", "spa", "wellness_center", "beach_resort"],
    Hostel: ["hostel", "budget_accommodation", "dormitory"],
    Apartment: ["serviced_apartment", "vacation_rental"],
  },

  Shopping: {
    Market: [
      "market",
      "bazaar",
      "flea_market",
      "street_market",
      "souvenir_shop",
    ],
    Clothing: [
      "clothing_store",
      "fashion_store",
      "boutique",
      "shoe_store",
      "jewelry_store",
    ],
    Electronics: ["electronics_store", "mobile_store", "computer_store"],
    Supermarket: [
      "supermarket",
      "grocery_store",
      "convenience_store",
      "hypermarket",
    ],
    Specialty: [
      "book_store",
      "toy_store",
      "gift_shop",
      "art_supply_store",
      "music_store",
      "pet_store",
    ],
  },

  Wellness: {
    Spa: ["spa", "beauty_salon", "nail_salon", "massage", "wellness_center"],
    Gym: [
      "gym",
      "fitness_center",
      "yoga_studio",
      "pilates_studio",
      "martial_arts",
    ],
    Medical: ["hospital", "clinic", "pharmacy", "dentist", "doctor"],
  },
};

const classifyPlace = (types = []) => {
  for (const category in categoryMap) {
    for (const subcategory in categoryMap[category]) {
      const keywords = categoryMap[category][subcategory];
      if (types.some((type) => keywords.includes(type))) {
        return { category, subcategory };
      }
    }
  }
  return { category: "Other", subcategory: "General" };
};

module.exports = classifyPlace;
