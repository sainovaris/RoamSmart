const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Place = require("./models/Place");

dotenv.config();

const rajkotPlaces = [
  {
    name: "Race Course",
    type: "Park",
    rating: 4.5,
    open_now: true,
    location: { type: "Point", coordinates: [70.7897, 22.303] }, // [Long, Lat]
    address: "Race Course Road, Rajkot, Gujarat",
  },
  {
    name: "Rajkot Junction - Railway Station",
    type: "Transportation",
    rating: 4.2,
    open_now: true,
    location: { type: "Point", coordinates: [70.8022, 22.3148] },
    address: "Station Road, Rajkot, Gujarat",
  },
  {
    name: "Mahatma Gandhi Museum",
    type: "Museum",
    rating: 4.7,
    open_now: true,
    location: { type: "Point", coordinates: [70.8021, 22.2983] },
    address: "Jubilee Chowk, Rajkot, Gujarat",
  },
  {
    name: "Ranjit Vilas Palace",
    type: "Historic",
    rating: 4.4,
    open_now: false,
    location: { type: "Point", coordinates: [70.8093, 22.2935] },
    address: "Palace Road, Rajkot, Gujarat",
  },
  {
    name: "Aji Dam",
    type: "Park",
    rating: 4.6,
    open_now: true,
    location: { type: "Point", coordinates: [70.8356, 22.2688] },
    address: "Aji River, Rajkot, Gujarat",
  },
];

const seedDB = async () => {
  try {
    // Connect using your URI from .env
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing data so we don't have duplicates
    await Place.deleteMany({});

    // Insert the new Rajkot points
    await Place.insertMany(rajkotPlaces);

    console.log("✅ Rajkot data points added successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
};

seedDB();
