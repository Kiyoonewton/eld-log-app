import { NextRequest, NextResponse } from "next/server";
import { TripData, OSRMRouteResponse, CombinedRoute } from "@/app/types";
import { calculateRoute } from "@/lib/routeCalculator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentLocation, pickupLocation, dropoffLocation, currentCycleUsed } = body as TripData;

    // Fetch routes from OSRM
    const pickupRouteRes = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${currentLocation.lng},${currentLocation.lat};${pickupLocation.lng},${pickupLocation.lat}?overview=full&geometries=geojson`
    );
    const pickupRouteData = (await pickupRouteRes.json()) as OSRMRouteResponse;

    if (pickupRouteData.code !== "Ok") {
      return NextResponse.json({ message: "OSRM error for pickup route", error: pickupRouteData.message }, { status: 500 });
    }

    const dropoffRouteRes = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${pickupLocation.lng},${pickupLocation.lat};${dropoffLocation.lng},${dropoffLocation.lat}?overview=full&geometries=geojson`
    );
    const dropoffRouteData = (await dropoffRouteRes.json()) as OSRMRouteResponse;

    if (dropoffRouteData.code !== "Ok") {
      return NextResponse.json({ message: "OSRM error for dropoff route", error: dropoffRouteData.message }, { status: 500 });
    }

    // Combine and process routes
    const combinedRoute = combineRoutes(pickupRouteData, dropoffRouteData);
    const routeWithStops = calculateRoute(combinedRoute, currentCycleUsed, currentLocation, pickupLocation, dropoffLocation);

    return NextResponse.json(routeWithStops);
  } catch (error) {
    console.error("Route calculation error:", error);
    return NextResponse.json({ message: "Error calculating route", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// Helper function to combine routes
function combineRoutes(route1: OSRMRouteResponse, route2: OSRMRouteResponse): CombinedRoute {
  return {
    distance:
      (route1.routes[0].distance / 1000) * 0.621371 +
      (route2.routes[0].distance / 1000) * 0.621371, // Convert meters to miles
    duration: route1.routes[0].duration + route2.routes[0].duration, // seconds
    coordinates: [
      ...route1.routes[0].geometry.coordinates,
      ...route2.routes[0].geometry.coordinates.slice(1),
    ] as [number, number][],
    pickup_coordinates: route1.routes[0].geometry.coordinates[
      route1.routes[0].geometry.coordinates.length - 1
    ] as [number, number],
    dropoff_coordinates: route2.routes[0].geometry.coordinates[
      route2.routes[0].geometry.coordinates.length - 1
    ] as [number, number],
  };
}
