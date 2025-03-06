import { DailyLogSheet, Stop, TripDetailsProps } from "@/app/types";

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
  onDutyHoursToday: number;
  stops: Stop[];
  eldLogs: DailyLogSheet[];
}

export interface TripContextType extends TripDetails {
  setTripDetails: (trip: TripDetails) => void;
}
