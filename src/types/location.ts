import { Coordinates } from "@/services/geocodingServices";

export interface LocationFormData {
  currentLocation: string;
  pickupLocation: string;
  dropoffLocation: string;
}

export interface LocationFormDataWithCoordinates {
  currentLocation: {
    address: string;
    coordinates: Coordinates | null;
  };
  pickupLocation: {
    address: string;
    coordinates: Coordinates | null;
  };
  dropoffLocation: {
    address: string;
    coordinates: Coordinates | null;
  };
}

export type LocationField = keyof LocationFormData;

export interface LocationSuggestions {
  currentLocation: string[];
  pickupLocation: string[];
  dropoffLocation: string[];
}