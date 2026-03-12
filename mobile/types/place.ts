export type Place = {
  id: string;
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