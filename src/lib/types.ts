export interface Location {
    address: string;
    lat?: number;
    lng?: number;
  }
  
  export interface TripDetails {
    currentLocation: Location;
    pickupLocation: Location;
    dropoffLocation: Location;
    currentCycleHours: number;
    startDate: string; // ISO string
  }
  
  export interface RouteSegment {
    startLocation: Location;
    endLocation: Location;
    distance: number; // in miles
    duration: number; // in minutes
    type: 'drive' | 'rest' | 'pickup' | 'dropoff' | 'fuel';
  }
  
  export interface Route {
    segments: RouteSegment[];
    totalDistance: number; // in miles
    totalDuration: number; // in minutes
    estimatedCompletionDate: string; // ISO string
  }
  
  export enum DutyStatus {
    OffDuty = 'OffDuty',
    Sleeper = 'Sleeper',
    Driving = 'Driving',
    OnDuty = 'OnDuty'
  }
  
  export interface LogEntry {
    status: DutyStatus;
    startTime: string; // ISO string
    endTime: string; // ISO string
    location: Location;
    remarks?: string;
  }
  
  export interface DailyLog {
    date: string; // ISO string
    driver: {
      name: string;
      licenseNumber: string;
      truckNumber: string;
    };
    carrier: {
      name: string;
      address: string;
    };
    totalMiles: number;
    entries: LogEntry[];
    shippingDocuments?: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }
  
  export interface MapBounds {
    northEast: { lat: number; lng: number };
    southWest: { lat: number; lng: number };
  }