// types/index.ts

// Location coordinates
export interface Coordinates {
    lat: number;
    lng: number;
  }
  
  // Trip input data
  export interface TripData {
    currentLocation: Coordinates;
    pickupLocation: Coordinates;
    dropoffLocation: Coordinates;
    currentCycleUsed: number; // Hours already used in the current cycle
  }
  
  // Stop types
  export type StopType = 'start' | 'pickup' | 'dropoff' | 'rest' | 'fuel' | 'overnight';
  
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
      legs: any[];
      weight: number;
      weight_name: string;
    }[];
    waypoints: any[];
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
    status: 'driving' | 'on-duty' | 'off-duty' | 'sleeper';
    location: string;
    miles: number;
  }
  
  // Daily log sheet
  export interface DailyLogSheet {
    date: string;
    driverName: string;
    truckNumber: string;
    startLocation: string;
    endLocation: string;
    totalMiles: number;
    logs: ELDLogEntry[];
    graphData: {
      // Data structured for rendering the ELD graph
      hourData: {
        hour: number;
        status: 'driving' | 'on-duty' | 'off-duty' | 'sleeper' | null;
      }[];
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