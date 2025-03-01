export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  address: string;
  coordinates: Coordinates;
}

export interface TripDetails {
  currentLocation: Location | null;
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  currentCycleHours: number;
}

export interface TripContextType extends TripDetails {
  setTripDetails: (trip: TripDetails) => void;
}