import { Location } from "@/context/types";

const fetchRoute = async (start: Location, end: Location) => {

  const url = `https://router.project-osrm.org/route/v1/driving/${start.coordinates.longitude},${start.coordinates.latitude};${end.coordinates.longitude},${end.coordinates.latitude}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error("No route found");
    }

    const route = data.routes[0];
    return {
      distance: route.distance, // in meters
      duration: route.duration, // in seconds
      geometry: route.geometry, // contains route coordinates
    };
  } catch (error) {
    console.error("Error fetching route:", error);
    return null;
  }
};

export { fetchRoute };
