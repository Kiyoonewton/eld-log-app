export interface City {
  id: string;
  name: string;
  country: string;
  adminCode?: string;
  population: number;
}

export interface TripKeys {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}
export interface TripDataProps {
  currentLocation: TripKeys;
  pickupLocation: TripKeys;
  dropoffLocation: TripKeys;
}
