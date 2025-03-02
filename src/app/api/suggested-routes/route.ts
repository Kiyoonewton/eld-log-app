import { geodesicDistance } from "@/utils/distance";
import fetch from "node-fetch"; // Required for API requests

// Define types for locations
type Coordinates = { latitude: number; longitude: number };
type Location = { address: string; coordinates: Coordinates };
type Stop = { name: string; coordinates: Coordinates; reason: string };

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { currentLocation, pickupLocation, dropoffLocation, currentCycleHours } = body.trip as {
            currentLocation: Location;
            pickupLocation: Location;
            dropoffLocation: Location;
            currentCycleHours: number;
        };

        // Calculate distances
        const distanceToPickup = geodesicDistance(currentLocation.coordinates, pickupLocation.coordinates);
        const distanceToDropoff = geodesicDistance(pickupLocation.coordinates, dropoffLocation.coordinates);
        const totalDistance = distanceToPickup + distanceToDropoff;

        let stops: Stop[] = [];

        // Get stops for the entire route (current → pickup → dropoff)
        const restStops = await getRestStopsAlongRoute(currentLocation.coordinates, dropoffLocation.coordinates);
        const fuelStops = await getFuelStationsAlongRoute(currentLocation.coordinates, dropoffLocation.coordinates);

        console.log('====================================');
        console.log(totalDistance);
        console.log('====================================');
        // Add a mandatory rest stop if driver has been driving for 8+ hours
        if (currentCycleHours >= 8 && restStops.length > 0) {
            stops.push({
                name: restStops[0].name, // Closest rest stop
                coordinates: restStops[0].coordinates,
                reason: "Required after 8 hours of driving",
            });
        }

        // Add a fuel stop if total distance is greater than 1000 miles
        if (totalDistance > 500 && fuelStops.length > 0) {
            stops.push({
                name: fuelStops[0].name, // Closest fuel station
                coordinates: fuelStops[0].coordinates,
                reason: "Fuel stop every 500 miles",
            });
        }

        return Response.json({ stops }, { status: 200 });
    } catch (error) {
        console.error("Error processing suggested stops:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Function to fetch rest stops **along the full route**
async function getRestStopsAlongRoute(start: Coordinates, end: Coordinates): Promise<Stop[]> {
    const overpassQuery = `
        [out:json];
        (
            node["amenity"="rest_area"](around:50000,${start.latitude},${start.longitude});
            node["amenity"="rest_area"](around:50000,${end.latitude},${end.longitude});
        );
        out body;
    `;
    return fetchOverpassData(overpassQuery);
}

// Function to fetch fuel stations **along the full route**
async function getFuelStationsAlongRoute(start: Coordinates, end: Coordinates): Promise<Stop[]> {
    const overpassQuery = `
        [out:json];
        (
            node["amenity"="fuel"](around:50000,${start.latitude},${start.longitude});
            node["amenity"="fuel"](around:50000,${end.latitude},${end.longitude});
        );
        out body;
    `;
    return fetchOverpassData(overpassQuery);
}

// Generic function to query OpenStreetMap Overpass API
async function fetchOverpassData(query: string): Promise<Stop[]> {
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
        console.error("Error fetching Overpass data:", response.statusText);
        return [];
    }

    const data = await response.json() as any;
    return data.elements.map((el: any) => ({
        name: el.tags?.name || "Unknown",
        coordinates: { latitude: el.lat, longitude: el.lon },
        reason: "Suggested stop along the route",
    }));
}
