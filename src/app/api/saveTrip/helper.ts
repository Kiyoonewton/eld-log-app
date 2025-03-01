import { Location } from "@/context/types";
import { fetchRoute } from "@/lib/osm";

export const selectedStops = async (
    currentLocation: Location,
    pickupLocation: Location,
    dropoffLocation: Location
  ) => {
    if (!currentLocation || !pickupLocation || !dropoffLocation) {
      throw new Error("All locations must be provided");
    }
  
    // 1️⃣ Fetch Route from Current → Pickup
    const route1 = await fetchRoute(currentLocation, pickupLocation);
    if (!route1) return { fullRoute: null, stops: [] };
  
    // 2️⃣ Fetch Route from Pickup → Dropoff
    const route2 = await fetchRoute(pickupLocation, dropoffLocation);
    if (!route2) return { fullRoute: null, stops: [] };
  
    // 3️⃣ Merge Routes
    const fullRoute = {
      distance: route1.distance + route2.distance,
      duration: route1.duration + route2.duration,
      coordinates: [...route1.geometry.coordinates, ...route2.geometry.coordinates],
    };
  
    console.log(
      `🚀 Distance: ${(fullRoute.distance / 500).toFixed(2)} km, Duration: ${(fullRoute.duration / 3600).toFixed(2)} hrs`
    );
  
    // 4️⃣ Generate Stops (Rest & Fuel)
    const stops: any[] = [];
    let drivingHours = 0;
    let drivenDistance = 0;
  
    for (const [longitude, latitude] of fullRoute.coordinates) {
      drivingHours += 1;
      drivenDistance += 100;
  
      if (drivingHours >= 8) {
        stops.push({ name: "Rest Stop", latitude, longitude, type: "rest" });
        drivingHours = 0;
      }
  
      if (drivenDistance >= 1600) {
        stops.push({ name: "Fuel Stop", latitude, longitude, type: "fuel" });
        drivenDistance = 0;
      }
    }
  
    return { fullRoute, stops };
  };
  
  export function geodesicDistance(start: { latitude: number; longitude: number }, end: { latitude: number; longitude: number }): number {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const R = 6371; // Earth's radius in kilometers
    const lat1 = toRadians(start.latitude);
    const lon1 = toRadians(start.longitude);
    const lat2 = toRadians(end.latitude);
    const lon2 = toRadians(end.longitude);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers
    return distance * 0.621371; // Convert to miles
}
