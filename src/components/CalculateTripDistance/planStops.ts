interface TripDetails {
    totalDistance: number; // in km
    totalDuration: number; // in minutes
    currentCycleHours: number; // hours driver has used in cycle
}

interface Stop {
    type: "rest" | "fuel" | "break";
    location: string; // Can be enhanced with real locations
    timeRequired: string;
}

export function planStops(trip: TripDetails): Stop[] {
    const stops: Stop[] = [];
    const maxDriveHours = 11;
    const breakAfterHours = 8;
    const fuelEveryMiles = 1000; // miles
    const totalHours = trip.totalDuration / 60;
    const totalMiles = trip.totalDistance * 0.621371; // Convert km to miles

    let hoursDriven = 0;
    let milesDriven = 0;

    // Plan stops
    while (hoursDriven < totalHours && milesDriven < totalMiles) {
        if (hoursDriven >= breakAfterHours) {
            stops.push({ type: "break", location: "Rest Stop (TBD)", timeRequired: "30 min" });
            hoursDriven -= breakAfterHours; // Reset break counter
        }
        if (hoursDriven >= maxDriveHours) {
            stops.push({ type: "rest", location: "Truck Stop (TBD)", timeRequired: "10 hours" });
            hoursDriven = 0; // Reset driving time
        }
        if (milesDriven >= fuelEveryMiles) {
            stops.push({ type: "fuel", location: "Gas Station (TBD)", timeRequired: "15 min" });
            milesDriven -= fuelEveryMiles; // Reset fuel counter
        }

        // Simulate driving
        hoursDriven += 1; 
        milesDriven += 60; // Assuming avg speed ~60 mph
    }

    return stops;
}

// Example Usage
// const tripData: TripDetails = {
//     totalDistance: 1500, // km
//     totalDuration: 1200, // minutes (20 hours)
//     currentCycleHours: 7,
// };

// console.log(planStops(tripData));
