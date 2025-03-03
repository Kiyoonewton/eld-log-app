interface Coordinates {
    latitude: number;
    longitude: number;
}

interface RouteResponse {
    distance: string;
    duration: string;
}

export async function getDistanceAndTimeOSRM(
    start: Coordinates,
    waypoint: Coordinates,
    end: Coordinates
): Promise<RouteResponse | null> {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${waypoint.longitude},${waypoint.latitude};${end.longitude},${end.latitude}?overview=false`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch route");

        const data = await response.json();

        if (data.code === "Ok" && data.routes.length > 0) {
            const route = data.routes[0];
            return {
                distance: `${(route.distance / 1000).toFixed(2)} km`, // Convert meters to km
                duration: `${(route.duration / 60).toFixed(2)} minutes` // Convert seconds to minutes
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching route:", error);
        return null;
    }
}

