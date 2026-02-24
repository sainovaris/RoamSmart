# RoamSmart – Luxury AI Travel Companion

RoamSmart is a real-time AI-powered travel companion designed to create personalized itineraries, guide users as they explore, and intelligently curate nearby experiences using live geospatial data.

This project demonstrates full-stack geospatial application architecture using MongoDB’s 2dsphere indexing with real-time GPS integration inside a React Native (Expo) mobile environment.

The system connects a live Node.js backend to a mobile frontend, enabling dynamic, distance-based recommendations rendered on an interactive map interface.

---

## 🚀 Core Feature: Real-Time Nearby Discovery

RoamSmart implements a complete geospatial discovery workflow:

- 📍 **Live GPS Detection** – Automatically captures device latitude and longitude.
- 🗺 **Geospatial Query Engine** – MongoDB `$near` queries fetch places within a configurable radius.
- 📱 **Interactive Map Interface** – Nearby locations rendered using `react-native-maps`.
- ⭐ **Contextual Place Details** – Rating, type, and operational status shown on marker selection.
- 🚫 **Graceful Empty States** – Clear messaging when no results are found.
- ⚡ **Live Frontend–Backend Integration** – Real-time API communication between mobile client and server.

---

## 🧠 System Architecture Flow

User opens app  
→ GPS captures latitude & longitude  
→ Frontend sends coordinates to backend  
→ Backend performs MongoDB `$near` geospatial query  
→ Places within radius returned  
→ Frontend converts GeoJSON format  
→ Map markers rendered  
→ User interacts with place details  

---

## 🏗 Tech Stack & Architectural Decisions

### Frontend

- **React Native (Expo)** – Cross-platform mobile development.
- **react-native-maps** – Native map rendering.
- **Axios** – HTTP client for API requests.
- **NativeWind (Tailwind for RN)** – Utility-first styling system.

**Why Expo?**  
Expo significantly reduces mobile development friction and enables instant testing on physical devices via Expo Go.

### Backend

- **Node.js + Express.js** – RESTful API layer.
- **MongoDB** – NoSQL database with native geospatial indexing.
- **Mongoose** – ODM for schema modeling.
- **2dsphere Index + GeoJSON** – Enables accurate spherical distance calculations.

---


## 🛠 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (Local or Cloud)
- Expo Go (for mobile testing)

---

## 🔧 Backend Setup

1. Navigate to backend:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

4. Start server:

```bash
npm start
```

Server runs at:

```
http://localhost:5000
```

## 📱 Frontend Setup

1. Navigate to mobile:

```bash
cd mobile
```

2. Install dependencies:

```bash
npm install
```

3. Start Expo:

```bash
npx expo start
```

---

## 📲 Running on Physical Device

1. Install **Expo Go**
   - Android → Google Play Store
   - iOS → App Store

2. Ensure laptop and mobile device are on the same WiFi network.

3. Run:

```bash
npx expo start
```

4. Scan the QR code using Expo Go.

---

**Why MongoDB Geospatial?**

MongoDB’s `$near` operator:
- Automatically sorts results by distance.
- Filters within a defined radius.
- Uses spherical geometry for real-world coordinate accuracy.

Example query:

```js
location: {
  $near: {
    $geometry: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
    $maxDistance: 5000, // 5km radius
  },
}
```

Coordinates are stored in MongoDB as:

```
[longitude, latitude]
```

Converted in frontend to:

```
{ latitude, longitude }
```

---

## 📁 Project Structure

```
RoamSmart/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── server.js
│   └── .env
│
├── mobile/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   └── App.tsx
```

---


## 🌐 Important: Backend URL for Mobile Testing

When testing on a physical device, replace `localhost` with your machine’s IPv4 address.

Find your IPv4:

```bash
ipconfig
```

Update:

```js
const BASE_URL = "http://YOUR_IPV4_ADDRESS:5000/api";
```

Example:

```js
const BASE_URL = "http://10.119.66.139:5000/api";
```

---

## ⚠ Known Limitations

- AI itinerary generation engine not yet implemented.
- Category-based filtering (restaurants/events) pending.
- Ranking formula (distance + rating + preference weightage) in progress.
- Offline caching not implemented.
- No personalization memory layer yet.

---

## 🔮 Future Roadmap

RoamSmart is designed to evolve into a fully autonomous AI travel companion capable of:

- Real-time adaptive itinerary generation
- Voice-guided navigation
- Context-aware recommendations
- Mood-based travel experiences
- Smart rerouting when plans change
- AI-powered ranking engine
- User preference learning model

---

## 🎯 Vision

RoamSmart aims to become a premium AI travel assistant that intelligently understands user context, location, preferences, and intent to deliver frictionless luxury travel experiences.

This project demonstrates:

- Full-stack system integration
- Real-time geospatial querying
- Mobile + backend API synchronization
- Clean modular architecture
- Production-oriented structure

---

## 📄 License

This project is built for educational and development purposes.

---
