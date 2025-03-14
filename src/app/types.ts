// Location coordinates
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationProps {
  address: string;
  coordinates?: Coordinates;
}
// Trip input data
export interface TripData {
  currentLocation: LocationProps;
  pickupLocation: LocationProps;
  dropoffLocation: LocationProps;
  currentCycleUsed: number;
}

// Stop types
export type StopType =
  | "start"
  | "pickup"
  | "dropoff"
  | "rest"
  | "fuel"
  | "overnight";

export interface TripDetailsProps{
  coordinates:number[][]
  stops: Stop[]
  totalDistance:number
  totalDuration:number
  eldLogs:DailyLogSheet[]
}

// Stop information
export interface Stop {
  type: StopType;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  duration: string;
  estimatedArrival: string; // ISO date string
}

// OSRM route response structure
export interface OSRMRouteResponse {
  routes: {
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
      type: string;
    };
    legs: unknown[];
    weight: number;
    weight_name: string;
  }[];
  waypoints: unknown[];
  code: string;
  message?: string;
}

// Combined route data
export interface CombinedRoute {
  distance: number; // In miles
  duration: number; // In seconds
  coordinates: [number, number][]; // [longitude, latitude]
  pickup_coordinates: [number, number];
  dropoff_coordinates: [number, number];
}

// ELD Log entry
export interface ELDLogEntry {
  date: string;
  startTime: string;
  endTime: string;
  status: "driving" | "on-duty" | "off-duty" | "sleeper-berth";
  location: string;
  miles: number;
}

// Daily log sheet
export interface DailyLogSheet {
  date: string;
  driverName: string;
  truckNumber: string;
  startLocation: LocationProps;
  endLocation: LocationProps;
  totalMilesDrivingToday:string;
  totalMileageToday:string;
  licensePlate:string;
  shippeCommodity:string;
  remarks:string;
  officeAddress:string;
  homeAddress:string;
  graphData: {
    hourData: {
      hour: number;
      status: "driving" | "on-duty" | "off-duty" | "sleeper-berth" | null;
    }[];
    remarks?: {
      time: number;
      location: string;
  }[]
  };
}

export interface NewDailyLogSheet {
  date: string;
  driverName: string;
  truckNumber: string;
  startLocation: string;
  endLocation: string;
  totalMilesDrivingToday:string;
  totalMileageToday:string;
  licensePlate:string;
  carrier?:string;
  remarks:string;
  officeAddress:string;
  homeAddress:string;
  graphData: {
    hourData: {
      hour: number;
      status: "driving" | "on-duty" | "off-duty" | "sleeper-berth" | null;
    }[];
    remarks?: {
      time: number;
      location: string;
  }[]
  };
}

// Final route data including stops and ELD logs
export interface RouteWithStops {
  coordinates: [number, number][]; // [longitude, latitude]
  stops: Stop[];
  totalDistance: number; // In miles
  totalDuration: number; // In seconds
  eldLogs: DailyLogSheet[];
}

export interface RouteOutput {
  timestamp: Date;
  location: string;
  coordinates: { lat: number; lng: number } | [number, number];
  type: "departure" | "pickup" | "stop" | "break" | "dropoff" | string;
  description: string;
  distance?: number;
  duration?: number;
}
