// types/location.ts

export interface LocationFormData {
    currentLocation: string;
    pickupLocation: string;
    dropoffLocation: string;
  }
  
  export type LocationField = keyof LocationFormData;
  
  export interface LocationSuggestions {
    currentLocation: string[];
    pickupLocation: string[];
    dropoffLocation: string[];
  }