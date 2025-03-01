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

// Example Usage
// const currentLocation = { latitude: 6.4669982, longitude: 3.5896566 };
// const pickupLocation = { latitude: 6.4711251, longitude: 3.8147504 };
// const dropoffLocation = { latitude: 6.5848212, longitude: 3.3329165 };

// getDistanceAndTimeOSRM(currentLocation, pickupLocation, dropoffLocation)
//     .then(console.log);
