// lib/routeCalculator.ts
import {
  TripData,
  CombinedRoute,
  Stop,
  RouteWithStops,
  DailyLogSheet,
  ELDLogEntry,
} from "@/app/types";

export function calculateRoute(
  routeData: CombinedRoute,
  hoursUsed: number,
  currentLocation: { lat: number; lng: number },
  pickupLocation: { lat: number; lng: number },
  dropoffLocation: { lat: number; lng: number }
): RouteWithStops {
  const totalDistance: number = routeData.distance; // in miles
  const totalDuration: number = routeData.duration; // in seconds

  // Convert to hours for calculation
  const totalDriveHours: number = totalDuration / 3600;

  // Initialize available hours
  const availableDriveHours: number = 11 - parseFloat(hoursUsed.toString());
  const availableDutyHours: number = 14 - parseFloat(hoursUsed.toString());

  // Calculate stops
  const stops: Stop[] = [];
  let currentPosition: number = 0; // miles into journey
  let currentTime: number = 0; // hours into journey

  // Add current location as starting point
  stops.push({
    type: "start",
    name: "Current Location",
    coordinates: [currentLocation.lng, currentLocation.lat],
    duration: "0 hours",
    estimatedArrival: new Date().toISOString(),
  });

  // Add pickup location
  const pickupIndex = routeData.coordinates.findIndex(
    (coord) =>
      coord[0] === routeData.pickup_coordinates[0] &&
      coord[1] === routeData.pickup_coordinates[1]
  );
  const pickupDistance =
    routeData.distance * (pickupIndex / routeData.coordinates.length);

  stops.push({
    type: "pickup",
    name: "Pickup Location",
    coordinates: [pickupLocation.lng, pickupLocation.lat],
    duration: "1 hour",
    estimatedArrival: calculateArrivalTime(pickupDistance / 60), // Assuming 60mph
  });

  currentPosition = pickupDistance;
  currentTime += pickupDistance / 60 + 1; // Add 1 hour for pickup

  // Calculate rest and overnight stops
  let availableHours = {
    drive: availableDriveHours - pickupDistance / 60,
    duty: availableDutyHours - pickupDistance / 60 - 1, // -1 for pickup time
  };

  while (currentPosition < totalDistance) {
    // Calculate how far driver can go with remaining hours
    const distancePossible = Math.min(
      availableHours.drive * 60, // avg speed 60mph
      availableHours.duty * 60
    );

    if (distancePossible + currentPosition >= totalDistance) {
      // Can complete trip
      break;
    }

    // Need to add a stop
    if (availableHours.drive < 8 || availableHours.duty < 10) {
      // Need an overnight stop (10 hours off)
      const positionAtStop = currentPosition + availableHours.drive * 60;
      const coordsAtStop = interpolatePosition(
        routeData,
        positionAtStop / totalDistance
      );

      stops.push({
        type: "overnight",
        name: "Required 10-Hour Rest",
        coordinates: coordsAtStop,
        duration: "10 hours",
        estimatedArrival: calculateArrivalTime(
          currentTime + availableHours.drive
        ),
      });

      currentPosition = positionAtStop;
      currentTime += availableHours.drive + 10; // Add drive time plus rest time
      availableHours = { drive: 11, duty: 14 };
    } else {
      // Need a 30-minute break
      const positionAtStop = currentPosition + 8 * 60; // 8 hours of driving
      const coordsAtStop = interpolatePosition(
        routeData,
        positionAtStop / totalDistance
      );

      stops.push({
        type: "rest",
        name: "30-Minute Break",
        coordinates: coordsAtStop,
        duration: "30 minutes",
        estimatedArrival: calculateArrivalTime(currentTime + 8),
      });

      currentPosition = positionAtStop;
      currentTime += 8.5; // 8 hours driving + 0.5 hour break
      availableHours.drive = availableHours.drive - 8;
      availableHours.duty = availableHours.duty - 8.5;
    }
  }

  // Add fuel stops every 1000 miles
  addFuelStops(stops, routeData, totalDistance);

  // Add dropoff location as final stop
  stops.push({
    type: "dropoff",
    name: "Dropoff Location",
    coordinates: [dropoffLocation.lng, dropoffLocation.lat],
    duration: "1 hour",
    estimatedArrival: calculateArrivalTime(
      currentTime + (totalDistance - currentPosition) / 60
    ),
  });

  return {
    coordinates: routeData.coordinates,
    stops: stops,
    totalDistance: totalDistance,
    totalDuration: totalDuration,
    eldLogs: generateEldLogs(stops, totalDistance, totalDuration),
  };
}

function interpolatePosition(
  routeData: CombinedRoute,
  percentage: number
): [number, number] {
  // Find coordinates at given percentage of route
  const index = Math.floor(percentage * routeData.coordinates.length);
  return routeData.coordinates[
    Math.min(index, routeData.coordinates.length - 1)
  ];
}

function calculateArrivalTime(hoursFromNow: number): string {
  const date = new Date();
  date.setTime(date.getTime() + hoursFromNow * 60 * 60 * 1000);
  return date.toISOString();
}

function addFuelStops(
  stops: Stop[],
  routeData: CombinedRoute,
  totalDistance: number
): void {
  // Implementation to add fuel stops every 1000 miles
  const existingStops = [...stops];
  let milesSinceLastFuel = 0;
  let lastPosition = 0;

  // Sort stops by position along route
  existingStops.sort((a, b) => {
    const aIndex = routeData.coordinates.findIndex(
      (coord) => coord[0] === a.coordinates[0] && coord[1] === a.coordinates[1]
    );
    const bIndex = routeData.coordinates.findIndex(
      (coord) => coord[0] === b.coordinates[0] && coord[1] === b.coordinates[1]
    );
    return aIndex - bIndex;
  });

  // Calculate distances between existing stops
  for (let i = 0; i < existingStops.length; i++) {
    const stopIndex = routeData.coordinates.findIndex(
      (coord) =>
        coord[0] === existingStops[i].coordinates[0] &&
        coord[1] === existingStops[i].coordinates[1]
    );
    const stopPosition =
      totalDistance * (stopIndex / routeData.coordinates.length);
    const distanceSinceLastStop = stopPosition - lastPosition;

    milesSinceLastFuel += distanceSinceLastStop;

    if (milesSinceLastFuel >= 900) {
      // Add fuel stop before reaching 1000 miles
      // Find position for fuel stop (at current stop location for simplicity)
      const fuelStopPosition = stopPosition;
      const fuelStopCoords = existingStops[i].coordinates;

      stops.push({
        type: "fuel",
        name: "Fuel Stop",
        coordinates: fuelStopCoords,
        duration: "45 minutes",
        estimatedArrival: existingStops[i].estimatedArrival,
      });

      milesSinceLastFuel = 0;
    }

    lastPosition = stopPosition;
  }
}

function generateEldLogs(
  stops: Stop[],
  totalDistance: number,
  totalDuration: number
): DailyLogSheet[] {
  // Generate ELD logs based on the stops and route
  const logs: DailyLogSheet[] = [];

  // Sort stops chronologically
  const sortedStops = [...stops].sort(
    (a, b) =>
      new Date(a.estimatedArrival).getTime() -
      new Date(b.estimatedArrival).getTime()
  );

  // Group stops by day
  const stopsByDay: { [key: string]: Stop[] } = {};

  sortedStops.forEach((stop) => {
    const date = new Date(stop.estimatedArrival).toISOString().split("T")[0];
    if (!stopsByDay[date]) {
      stopsByDay[date] = [];
    }
    stopsByDay[date].push(stop);
  });

  // Create a log sheet for each day
  Object.entries(stopsByDay).forEach(([date, dayStops]) => {
    const logEntries: ELDLogEntry[] = [];
    let currentStatus: "driving" | "on-duty" | "off-duty" | "sleeper" =
      "driving";
    let dayMiles = 0;

    // Create log entries between stops
    for (let i = 0; i < dayStops.length - 1; i++) {
      const currentStop = dayStops[i];
      const nextStop = dayStops[i + 1];

      const startTime = new Date(currentStop.estimatedArrival);
      const endTime = new Date(nextStop.estimatedArrival);

      // Determine status between stops
      switch (currentStop.type) {
        case "start":
        case "rest":
        case "fuel":
          currentStatus = "driving";
          break;
        case "pickup":
        case "dropoff":
          currentStatus = "on-duty";
          break;
        case "overnight":
          currentStatus = "sleeper";
          break;
      }

      // Add log entry
      logEntries.push({
        date,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: currentStatus,
        location: `${currentStop.coordinates[1].toFixed(
          4
        )}, ${currentStop.coordinates[0].toFixed(4)}`,
        miles:
          currentStatus === "driving"
            ? calculateDistance(currentStop.coordinates, nextStop.coordinates)
            : 0,
      });

      // Add miles if driving
      if (currentStatus === "driving") {
        dayMiles += calculateDistance(
          currentStop.coordinates,
          nextStop.coordinates
        );
      }
    }

    // Create graph data (24 hour grid)
    const hourData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      status: null as "driving" | "on-duty" | "off-duty" | "sleeper" | null,
    }));

    // Fill in graph data from log entries
    logEntries.forEach((entry) => {
      const startHour = new Date(entry.startTime).getHours();
      const endHour = new Date(entry.endTime).getHours();

      for (let h = startHour; h <= endHour; h++) {
        hourData[h].status = entry.status;
      }
    });

    // Create the log sheet
    logs.push({
      date,
      driverName: "Driver Name", // Placeholder, would get from user input
      truckNumber: "Truck #", // Placeholder, would get from user input
      startLocation: logEntries[0]?.location || "Unknown",
      endLocation: logEntries[logEntries.length - 1]?.location || "Unknown",
      totalMiles: Math.round(dayMiles),
      logs: logEntries,
      graphData: { hourData },
    });
  });

  return logs;
}

function calculateDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  // Haversine formula to calculate distance between two coordinates
  const R = 3958.8; // Earth's radius in miles
  const lat1 = (coord1[1] * Math.PI) / 180;
  const lat2 = (coord2[1] * Math.PI) / 180;
  const diffLat = lat2 - lat1;
  const diffLng = ((coord2[0] - coord1[0]) * Math.PI) / 180;

  const a =
    Math.sin(diffLat / 2) * Math.sin(diffLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(diffLng / 2) *
      Math.sin(diffLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}
