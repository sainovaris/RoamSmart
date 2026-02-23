const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Place = require("./models/Place");

dotenv.config();

const samplePlaces = [
  {
    name: "The Oberoi Amarvilas",
    type: "Hotel",
    rating: 4.9,
    open_now: true,
    location: { type: "Point", coordinates: [78.0421, 27.1682] },
  },
  {
    name: "Agra Fort",
    type: "Historic",
    rating: 4.5,
    open_now: true,
    location: { type: "Point", coordinates: [78.0211, 27.1795] },
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Place.deleteMany({}); // Clears existing data
    await Place.insertMany(samplePlaces);
    console.log("✅ Sample data added successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
};

seedDB();
