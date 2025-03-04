// Interface for individual trip data entry
export interface TripData {
    type: 'start' | 'overnight' | 'pickup' | 'rest' | 'fuel' | 'dropoff';
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
    duration: string; // e.g., "10 hours" or "30 minutes"
    estimatedArrival: string; // ISO date string
}

// export Interface for duty status in graph data
export interface DutyStatus {
    time: number; // Hours from start
    status: 'off-duty' | 'driving' | 'sleeper-berth' | 'on-duty';
}

// export Interface for remark in graph data
export interface Remark {
    time: number; // Hours from start
    location: string;
}

// export Interface for the final graph data output
export interface GraphData {
    dutyStatuses: DutyStatus[];
    remarks: Remark[];
}

// Partial export interface for Nominatim reverse geocoding response (simplified)
export interface NominatimResponse {
    display_name: string;
    address?: {
        city?: string;
        state?: string;
        country?: string;
    };
}