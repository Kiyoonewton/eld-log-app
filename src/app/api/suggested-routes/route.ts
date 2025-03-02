// pages/api/route.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { TripData, OSRMRouteResponse, CombinedRoute, RouteWithStops } from '../../types';
import { calculateRoute } from '../../lib/routeCalculator';

type ResponseData = RouteWithStops | { message: string; error?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      currentLocation, 
      pickupLocation, 
      dropoffLocation, 
      currentCycleUsed 
    } = req.body as TripData;

    // First get route from current to pickup
    const pickupRouteRes = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${currentLocation.lng},${currentLocation.lat};${pickupLocation.lng},${pickupLocation.lat}?overview=full&geometries=geojson`
    );
    const pickupRouteData = await pickupRouteRes.json() as OSRMRouteResponse;
    
    if (pickupRouteData.code !== 'Ok') {
      throw new Error(`OSRM error for pickup route: ${pickupRouteData.message || 'Unknown error'}`);
    }
    
    // Then get route from pickup to dropoff
    const dropoffRouteRes = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${pickupLocation.lng},${pickupLocation.lat};${dropoffLocation.lng},${dropoffLocation.lat}?overview=full&geometries=geojson`
    );
    const dropoffRouteData = await dropoffRouteRes.json() as OSRMRouteResponse;
    
    if (dropoffRouteData.code !== 'Ok') {
      throw new Error(`OSRM error for dropoff route: ${dropoffRouteData.message || 'Unknown error'}`);
    }
    
    // Combine routes and process
    const combinedRoute = combineRoutes(pickupRouteData, dropoffRouteData);
    
    // Add required stops based on HOS rules
    const routeWithStops = calculateRoute(
      combinedRoute, 
      currentCycleUsed, 
      currentLocation,
      pickupLocation,
      dropoffLocation
    );
    
    return res.status(200).json(routeWithStops);
  } catch (error) {
    console.error('Route calculation error:', error);
    return res.status(500).json({ 
      message: 'Error calculating route', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function combineRoutes(route1: OSRMRouteResponse, route2: OSRMRouteResponse): CombinedRoute {
  // Combine two route segments, removing duplicate connecting point
  return {
    distance: route1.routes[0].distance/1000 * 0.621371 + route2.routes[0].distance/1000 * 0.621371, // Convert m to miles
    duration: route1.routes[0].duration + route2.routes[0].duration, // seconds
    coordinates: [
      ...route1.routes[0].geometry.coordinates,
      ...route2.routes[0].geometry.coordinates.slice(1)
    ] as [number, number][],
    pickup_coordinates: route1.routes[0].geometry.coordinates[route1.routes[0].geometry.coordinates.length - 1] as [number, number],
    dropoff_coordinates: route2.routes[0].geometry.coordinates[route2.routes[0].geometry.coordinates.length - 1] as [number, number]
  };
}