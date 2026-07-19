import type { ImageSourcePropType } from "react-native";

export type Homestay = {
  id: string;
  slug: string;
  title: string;
  description: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  imageSource: ImageSourcePropType;
  nightlyPrice: number;
  currency: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  propertyType: "house" | "apartment" | "guest_house" | "cabin" | "villa" | "room";
  roomType: "entire_place" | "private_room" | "shared_room";
  amenities: string[];
  houseRules: string[];
  checkInTime: string;
  checkOutTime: string;
  hostName: string;
  rating: number;
  reviewCount: number;
};
