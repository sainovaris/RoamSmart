export type Place = {
  id: string;            // DB id (preferred)
  place_id: string;      // Google place id fallback
  name: string;

  latitude: number;
  longitude: number;

  rating: number;
  type: string;

  open_now: boolean;
  distance: number;
};

export type AIDetails = {
  overview: string;
  highlights: string[];
  best_time_to_visit: string;
  travel_tips: string;
  recommended_duration: string;
  booking_required: boolean;
};

export type ItineraryItem = {
  name: string;
  place_id: string;
  id: string;
  category: string;
  subcategory?: string;

  latitude?: number;
  longitude?: number;

  duration_minutes: number;

  visit_start: string; // ISO
  visit_end: string;   // ISO

  ai_details?: AIDetails | null;

  videos?: {
    title: string;
    videoId: string;
    thumbnail: string;
  }[];
};