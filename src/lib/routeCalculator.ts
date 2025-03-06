// lib/routeCalculator.ts
// Type definitions
interface TripData {
  origin: string;
  destination: string;
  pickupLocation: string;
  dropoffLocation: string;
  loadType: string;
  weight: number;
  distance: number;
  duration: number;
}

interface Coordinate {
  lat: number;
  lng: number;
}

interface CombinedRoute {
  distance: number;
  duration: number;
  coordinates: [number, number][];
  pickup_coordinates: [number, number];
  dropoff_coordinates: [number, number];
}

interface Stop {
  type: 'start' | 'pickup' | 'dropoff' | 'rest' | 'overnight' | 'fuel' | 'pretrip' | 'off-duty';
  name: string;
  coordinates: [number, number];
  duration: string;
  estimatedArrival: string;
}

interface RouteWithStops {
  coordinates: [number, number][];
  stops: Stop[];
  totalDistance: number;
  totalDuration: number;
  eldLogs: DailyLogSheet[];
}

interface DutyStatus {
  hour: number;
  status: 'driving' | 'on-duty' | 'off-duty' | 'sleeper-berth';
}

interface Remark {
  time: number;
  location: string;
}

interface Violation {
  type: string;
  description: string;
}

interface ELDLogEntry {
  date: string;
  startTime: string;
  endTime: string;
  status: 'driving' | 'on-duty' | 'off-duty' | 'sleeper-berth';
  location: string;
  miles: number;
  remarks?: string;
}

interface DailyLogSheet {
  date: string;
  driverName: string;
  driverID: string;
  truckNumber: string;
  trailerNumber: string;
  carrier: string;
  homeTerminal: string;
  shippingDocNumber: string;
  startOdometer: number;
  endOdometer: number;
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime: string;
  totalMiles: number;
  totalHours: number;
  logs: ELDLogEntry[];
  certificationTime: string;
  certificationStatus: 'Certified' | 'Uncertified';
  graphData: {
    hourData: DutyStatus[];
    remarks: Remark[];
  };
  violations: Violation[];
}
import { sortStopsByArrival } from "@/utils/sortStopsBydate";

// Constants for time restrictions
const PRE_TRIP_START_HOUR = 6.5; // 6:30 AM
const DRIVING_START_HOUR = 7; // 7:00 AM
const DRIVING_END_HOUR = 17.5; // 5:30 PM
const SLEEPER_START_HOUR = 19; // 7:00 PM
const SLEEPER_END_HOUR = 6.5; // 6:30 AM
const FUEL_STOP_INTERVAL = 1000; // Miles between fuel stops
const PICKUP_DURATION = 0.5; // 30 minutes for pickup
const DROPOFF_DURATION = 0.5; // 30 minutes for dropoff
const FUEL_DURATION = 0.5; // 30 minutes for fuel
const BREAK_DURATION = 0.5; // 30 minutes for break

/**
 * Calculates a route with stops, including ELD logs based on hours of service regulations.
 * 
 * @param combinedRoute - The route data with coordinates and distance
 * @param currentCycleUsed - Hours already used in the current duty cycle
 * @param currentLocation - Starting coordinates
 * @param pickupLocation - Pickup location coordinates
 * @param dropoffLocation - Dropoff location coordinates
 * @returns Route with calculated stops and ELD logs
 */
export function calculateRoute(
  combinedRoute: CombinedRoute,
  currentCycleUsed: number,
  currentLocation: Coordinate,
  pickupLocation: Coordinate,
  dropoffLocation: Coordinate
): RouteWithStops {
  const totalDistance: number = combinedRoute.distance; // in miles
  const totalDuration: number = combinedRoute.duration; // in seconds

  // Convert to hours for calculation
  const totalDriveHours: number = totalDuration / 3600;

  // Initialize available hours
  const availableDriveHours: number = 11 - parseFloat(currentCycleUsed.toString());
  const availableDutyHours: number = 14 - parseFloat(currentCycleUsed.toString());

  // Calculate stops
  const stops: Stop[] = [];
  let currentPosition: number = 0; // miles into journey
  let milesSinceLastFuel: number = 0;
  
  // Current timestamp to track actual time throughout the journey
  // Start at 6:00 AM as per your example
  let currentTimestamp = new Date();
  currentTimestamp.setHours(6, 0, 0, 0);
  
  // Add current location as starting point
  stops.push({
    type: "start",
    name: "Current Location",
    coordinates: [currentLocation.lng, currentLocation.lat],
    duration: "0 hours",
    estimatedArrival: currentTimestamp.toISOString()
  });
  
  // Current duty status starts as off-duty
  let currentDutyStatus = "off-duty";
  
  // Daily logs collection
  let dailyLogs: DailyLogSheet[] = [];
  let currentDayLog: DailyLogSheet | null = null;
  let currentDutyStatuses: DutyStatus[] = [];
  let currentRemarks: Remark[] = [];
  
  // Initialize the first day's log
  const currentDate = currentTimestamp.toISOString().split('T')[0];
  currentDayLog = {
    date: currentDate,
    driverName: "Driver Name",
    driverID: "DL12345678",
    truckNumber: "Truck-123",
    trailerNumber: "Trailer-456",
    carrier: "Sample Carrier Inc.",
    homeTerminal: "Los Angeles Terminal",
    shippingDocNumber: "BOL-789012",
    startOdometer: 120500,
    endOdometer: 0, // Will be calculated
    startLocation: `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`,
    endLocation: "",
    startTime: currentTimestamp.toISOString(),
    endTime: "", // Will be set at end of day
    totalMiles: 0,
    totalHours: 0, // Will be calculated
    logs: [],
    certificationTime: "", // Will be set at end of day
    certificationStatus: "Uncertified",
    graphData: {
      hourData: [],
      remarks: []
    },
    violations: [] // Will track HOS violations if any
  };
  
  // Add initial off-duty status
  addDutyStatus(currentDutyStatuses, 0, "off-duty");
  
  // Check if current time is within pre-trip inspection time
  if (currentTimestamp.getHours() + (currentTimestamp.getMinutes() / 60) >= PRE_TRIP_START_HOUR &&
      currentTimestamp.getHours() + (currentTimestamp.getMinutes() / 60) < DRIVING_START_HOUR) {
    // Add pre-trip inspection
    const pretrip: Stop = {
      type: "pretrip",
      name: "Pre-trip Inspection",
      coordinates: [currentLocation.lng, currentLocation.lat],
      duration: `${(DRIVING_START_HOUR - PRE_TRIP_START_HOUR).toFixed(1)} hours`,
      estimatedArrival: currentTimestamp.toISOString()
    };
    stops.push(pretrip);
    
    // Update time to after pre-trip
    const pretripTime = DRIVING_START_HOUR - (currentTimestamp.getHours() + (currentTimestamp.getMinutes() / 60));
    currentTimestamp = new Date(currentTimestamp.getTime() + pretripTime * 60 * 60 * 1000);
    
    // Add on-duty status for pre-trip
    addDutyStatus(currentDutyStatuses, PRE_TRIP_START_HOUR, "on-duty");
    addRemark(currentRemarks, PRE_TRIP_START_HOUR, "Pre-trip Inspection");
    
    currentDutyStatus = "on-duty";
  }
  
  // Add driving status at 7 AM if we're at or past that time
  if (currentTimestamp.getHours() >= DRIVING_START_HOUR) {
    addDutyStatus(currentDutyStatuses, DRIVING_START_HOUR, "driving");
    addRemark(currentRemarks, DRIVING_START_HOUR, "Start Driving");
    currentDutyStatus = "driving";
  }
  
  // Add pickup location
  // Find distance to pickup
  const pickupIndex = findClosestCoordinateIndex(
    combinedRoute.coordinates,
    [pickupLocation.lng, pickupLocation.lat]
  );
  const pickupDistance = totalDistance * (pickupIndex / combinedRoute.coordinates.length);
  
  // Calculate driving time to pickup
  const driveTimeToPickup = pickupDistance / 60; // Assuming average 60 mph
  
  // Calculate arrival timestamp with time restrictions
  let pickupArrivalTime = calculateTimeRestrictedArrival(
    currentTimestamp,
    driveTimeToPickup
  );
  
  // Add pickup stop
  stops.push({
    type: "pickup",
    name: "Pickup Location",
    coordinates: [pickupLocation.lng, pickupLocation.lat],
    duration: `${PICKUP_DURATION} hours`,
    estimatedArrival: pickupArrivalTime.toISOString()
  });
  
  // Update current position and time
  currentPosition = pickupDistance;
  milesSinceLastFuel += pickupDistance;
  
  // Add remark for pickup
  const pickupHour = pickupArrivalTime.getHours() + (pickupArrivalTime.getMinutes() / 60);
  addRemark(currentRemarks, pickupHour, `Pickup at ${getLocationName(pickupLocation)}`);
  
  // Add on-duty status for pickup
  addDutyStatus(currentDutyStatuses, pickupHour, "on-duty");
  
  // Update current time after pickup operation
  currentTimestamp = new Date(pickupArrivalTime.getTime() + PICKUP_DURATION * 60 * 60 * 1000);
  
  // Add driving status after pickup
  const afterPickupHour = currentTimestamp.getHours() + (currentTimestamp.getMinutes() / 60);
  addDutyStatus(currentDutyStatuses, afterPickupHour, "driving");
  currentDutyStatus = "driving";
  
  // Check for 8-hour driving limit and need for breaks
  let hoursOfDrivingSinceLastBreak = driveTimeToPickup;
  
  // Calculate remaining distance to destination
  let remainingDistance = totalDistance - currentPosition;
  
  // Process the route until we reach the destination
  while (remainingDistance > 0) {
    // Calculate how much more we can drive before next stop is needed
    const hoursUntilBreakNeeded = 8 - hoursOfDrivingSinceLastBreak;
    const hoursUntilEndOfDrivingDay = calculateHoursUntilEndOfDrivingDay(currentTimestamp);
    
    // Determine the limiting factor
    const maxDrivingHours = Math.min(
      hoursUntilBreakNeeded, 
      hoursUntilEndOfDrivingDay,
      availableDriveHours
    );
    
    // Calculate how far we can go
    const possibleDrivingDistance = maxDrivingHours * 60; // at 60 mph
    
    // Check if we need a fuel stop
    const distanceToFuelStop = FUEL_STOP_INTERVAL - milesSinceLastFuel;
    const needFuelStop = distanceToFuelStop <= possibleDrivingDistance;
    
    if (needFuelStop && distanceToFuelStop > 0) {
      // We'll hit a fuel stop before other constraints
      const drivingHoursToFuel = distanceToFuelStop / 60;
      
      // Calculate position and time for fuel stop
      const fuelPosition = currentPosition + distanceToFuelStop;
      const fuelCoordinates = interpolatePosition(
        combinedRoute,
        fuelPosition / totalDistance
      );
      
      const fuelArrivalTime = calculateTimeRestrictedArrival(
        currentTimestamp,
        drivingHoursToFuel
      );
      
      // Add fuel stop
      stops.push({
        type: "fuel",
        name: "Fuel Stop",
        coordinates: fuelCoordinates,
        duration: `${FUEL_DURATION} hours`,
        estimatedArrival: fuelArrivalTime.toISOString()
      });
      
      // Update tracking variables
      currentPosition = fuelPosition;
      remainingDistance -= distanceToFuelStop;
      hoursOfDrivingSinceLastBreak += drivingHoursToFuel;
      milesSinceLastFuel = 0;
      
      // Add fueling remark and duty status change
      const fuelHour = fuelArrivalTime.getHours() + (fuelArrivalTime.getMinutes() / 60);
      addRemark(currentRemarks, fuelHour, "Fuel Stop");
      addDutyStatus(currentDutyStatuses, fuelHour, "on-duty");
      
      // Update current time and duty status
      currentTimestamp = new Date(fuelArrivalTime.getTime() + FUEL_DURATION * 60 * 60 * 1000);
      const afterFuelHour = currentTimestamp.getHours() + (currentTimestamp.getMinutes() / 60);
      addDutyStatus(currentDutyStatuses, afterFuelHour, "driving");
      currentDutyStatus = "driving";
      
      // Check if we've changed days during this operation
      checkAndUpdateDay(currentTimestamp, currentDayLog, dailyLogs, currentDutyStatuses, currentRemarks, stops, currentPosition);
      
    } else if (maxDrivingHours <= 0 || maxDrivingHours >= remainingDistance / 60) {
      // We can reach the destination or we need to stop immediately
      if (maxDrivingHours <= 0) {
        // We've hit the end of driving day or used up all driving hours
        const restCoordinates = interpolatePosition(
          combinedRoute,
          currentPosition / totalDistance
        );
        
        // If it's end of driving day, add off-duty period
        if (hoursUntilEndOfDrivingDay <= 0) {
          // End of driving day, add off-duty
          const offDutyStart = new Date(currentTimestamp);
          
          // Add off-duty stop
          stops.push({
            type: "off-duty",
            name: "End of Driving Day",
            coordinates: restCoordinates,
            duration: `${SLEEPER_START_HOUR - DRIVING_END_HOUR} hours`,
            estimatedArrival: offDutyStart.toISOString()
          });
          
          // Add off-duty status
          addDutyStatus(currentDutyStatuses, DRIVING_END_HOUR, "off-duty");
          addRemark(currentRemarks, DRIVING_END_HOUR, "End of Driving Day");
          
          // Advance time to sleeper berth start
          currentTimestamp = new Date(offDutyStart);
          currentTimestamp.setHours(SLEEPER_START_HOUR, 0, 0, 0);
          
          // Add sleeper berth
          stops.push({
            type: "overnight",
            name: "10-Hour Rest",
            coordinates: restCoordinates,
            duration: `${24 - SLEEPER_START_HOUR + SLEEPER_END_HOUR} hours`,
            estimatedArrival: currentTimestamp.toISOString()
          });
          
          // Add sleeper status
          addDutyStatus(currentDutyStatuses, SLEEPER_START_HOUR, "sleeper-berth");
          addRemark(currentRemarks, SLEEPER_START_HOUR, "10-Hour Rest");
          
          // Advance to next day
          currentTimestamp = new Date(currentTimestamp.getTime() + (24 - SLEEPER_START_HOUR + SLEEPER_END_HOUR) * 60 * 60 * 1000);
          
          // Create new day's log
          checkAndUpdateDay(currentTimestamp, currentDayLog, dailyLogs, currentDutyStatuses, currentRemarks, stops, currentPosition);
          
          // Reset counters for new day
          hoursOfDrivingSinceLastBreak = 0;
          // availableDriveHours = 11;
          // availableDutyHours = 14;
          
          // Start new day with pre-trip
          addDutyStatus(currentDutyStatuses, PRE_TRIP_START_HOUR, "on-duty");
          addRemark(currentRemarks, PRE_TRIP_START_HOUR, "Pre-trip Inspection");
          
          // Then switch to driving at 7 AM
          addDutyStatus(currentDutyStatuses, DRIVING_START_HOUR, "driving");
          addRemark(currentRemarks, DRIVING_START_HOUR, "Resume Driving");
          
          currentDutyStatus = "driving";
        } else {
          // Need a 30-minute break before continuing
          stops.push({
            type: "rest",
            name: "30-Minute Break",
            coordinates: restCoordinates,
            duration: `${BREAK_DURATION} hours`,
            estimatedArrival: currentTimestamp.toISOString()
          });
          
          // Add break remark and status
          const breakHour = currentTimestamp.getHours() + (currentTimestamp.getMinutes() / 60);
          addDutyStatus(currentDutyStatuses, breakHour, "off-duty");
          addRemark(currentRemarks, breakHour, "Break - 30min");
          
          // Advance time
          currentTimestamp = new Date(currentTimestamp.getTime() + BREAK_DURATION * 60 * 60 * 1000);
          
          // Resume driving
          const afterBreakHour = currentTimestamp.getHours() + (currentTimestamp.getMinutes() / 60);
          addDutyStatus(currentDutyStatuses, afterBreakHour, "driving");
          
          // Reset driving hours counter
          hoursOfDrivingSinceLastBreak = 0;
          currentDutyStatus = "driving";
        }
      } else {
        // We can reach the destination
        const finalDriveHours = remainingDistance / 60;
        const dropoffArrivalTime = calculateTimeRestrictedArrival(
          currentTimestamp,
          finalDriveHours
        );
        
        // Update mileage for fuel tracking
        milesSinceLastFuel += remainingDistance;
        
        // Add dropoff location
        stops.push({
          type: "dropoff",
          name: "Dropoff Location",
          coordinates: [dropoffLocation.lng, dropoffLocation.lat],
          duration: `${DROPOFF_DURATION} hours`,
          estimatedArrival: dropoffArrivalTime.toISOString()
        });
        
        // Add dropoff remark and duty status
        const dropoffHour = dropoffArrivalTime.getHours() + (dropoffArrivalTime.getMinutes() / 60);
        addDutyStatus(currentDutyStatuses, dropoffHour, "on-duty");
        addRemark(currentRemarks, dropoffHour, `Dropoff at ${getLocationName(dropoffLocation)}`);
        
        // Update current position and remaining distance
        currentPosition += remainingDistance;
        remainingDistance = 0;
        
        // Complete the current day's log
        if (currentDayLog) {
          currentDayLog.endLocation = `${dropoffLocation.lat.toFixed(4)}, ${dropoffLocation.lng.toFixed(4)}`;
          currentDayLog.totalMiles = Math.round(currentPosition);
          currentDayLog.graphData.hourData = currentDutyStatuses;
          currentDayLog.graphData.remarks = currentRemarks;
          dailyLogs.push(currentDayLog);
        }
      }
    } else {
      // We need a planned stop before reaching destination
      const drivingDistance = maxDrivingHours * 60;
      const stopPosition = currentPosition + drivingDistance;
      const stopCoordinates = interpolatePosition(
        combinedRoute,
        stopPosition / totalDistance
      );
      
      const stopArrivalTime = calculateTimeRestrictedArrival(
        currentTimestamp,
        maxDrivingHours
      );
      
      if (maxDrivingHours === hoursUntilEndOfDrivingDay) {
        // End of driving day
        // Add off-duty period
        stops.push({
          type: "off-duty",
          name: "End of Driving Day",
          coordinates: stopCoordinates,
          duration: `${SLEEPER_START_HOUR - DRIVING_END_HOUR} hours`,
          estimatedArrival: stopArrivalTime.toISOString()
        });
        
        // Add off-duty status
        addDutyStatus(currentDutyStatuses, DRIVING_END_HOUR, "off-duty");
        addRemark(currentRemarks, DRIVING_END_HOUR, "End of Driving Day");
        
        // Advance time to sleeper berth start
        currentTimestamp = new Date(stopArrivalTime);
        currentTimestamp.setHours(SLEEPER_START_HOUR, 0, 0, 0);
        
        // Add sleeper berth
        stops.push({
          type: "overnight",
          name: "10-Hour Rest",
          coordinates: stopCoordinates,
          duration: `${24 - SLEEPER_START_HOUR + SLEEPER_END_HOUR} hours`,
          estimatedArrival: currentTimestamp.toISOString()
        });
        
        // Add sleeper status
        addDutyStatus(currentDutyStatuses, SLEEPER_START_HOUR, "sleeper-berth");
        addRemark(currentRemarks, SLEEPER_START_HOUR, "10-Hour Rest");
        
        // Advance to next day
        currentTimestamp = new Date(currentTimestamp.getTime() + (24 - SLEEPER_START_HOUR + SLEEPER_END_HOUR) * 60 * 60 * 1000);
        
        // Create new day's log
        checkAndUpdateDay(currentTimestamp, currentDayLog, dailyLogs, currentDutyStatuses, currentRemarks, stops, currentPosition);
        
        // Reset counters for new day
        hoursOfDrivingSinceLastBreak = 0;
        // availableDriveHours = 11;
        // availableDutyHours = 14;
        
        // Start new day with pre-trip
        addDutyStatus(currentDutyStatuses, PRE_TRIP_START_HOUR, "on-duty");
        addRemark(currentRemarks, PRE_TRIP_START_HOUR, "Pre-trip Inspection");
        
        // Then switch to driving at 7 AM
        addDutyStatus(currentDutyStatuses, DRIVING_START_HOUR, "driving");
        addRemark(currentRemarks, DRIVING_START_HOUR, "Resume Driving");
        
        currentDutyStatus = "driving";
      } else if (maxDrivingHours === hoursUntilBreakNeeded) {
        // Need a 30-minute break
        stops.push({
          type: "rest",
          name: "30-Minute Break",
          coordinates: stopCoordinates,
          duration: `${BREAK_DURATION} hours`,
          estimatedArrival: stopArrivalTime.toISOString()
        });
        
        // Add break remark and status
        const breakHour = stopArrivalTime.getHours() + (stopArrivalTime.getMinutes() / 60);
        addDutyStatus(currentDutyStatuses, breakHour, "off-duty");
        addRemark(currentRemarks, breakHour, "Break - 30min");
        
        // Advance time
        currentTimestamp = new Date(stopArrivalTime.getTime() + BREAK_DURATION * 60 * 60 * 1000);
        
        // Reset driving hours counter
        hoursOfDrivingSinceLastBreak = 0;
        
        // Resume driving after break
        const afterBreakHour = currentTimestamp.getHours() + (currentTimestamp.getMinutes() / 60);
        addDutyStatus(currentDutyStatuses, afterBreakHour, "driving");
        currentDutyStatus = "driving";
      }
      
      // Update current position and tracking variables
      currentPosition = stopPosition;
      remainingDistance -= drivingDistance;
      milesSinceLastFuel += drivingDistance;
    }
  }
  
  // Ensure the day's log is completed and added to the collection
  if (currentDayLog && !dailyLogs.some(log => log.date === currentDayLog!.date)) {
    currentDayLog.graphData.hourData = currentDutyStatuses;
    currentDayLog.graphData.remarks = currentRemarks;
    currentDayLog.totalMiles = Math.round(currentPosition);
    dailyLogs.push(currentDayLog);
  }
  
  return {
    coordinates: combinedRoute.coordinates,
    stops: sortStopsByArrival(stops as any),
    totalDistance: totalDistance,
    totalDuration: totalDuration,
    eldLogs: dailyLogs
  };
}

/**
 * Calculates how many hours remain until the end of the driving day
 * 
 * @param currentTime - Current timestamp
 * @returns Hours remaining until driving end time
 */
function calculateHoursUntilEndOfDrivingDay(currentTime: Date): number {
  const currentHour = currentTime.getHours() + (currentTime.getMinutes() / 60);
  if (currentHour >= DRIVING_END_HOUR) {
    return 0;
  }
  return DRIVING_END_HOUR - currentHour;
}

/**
 * Calculates arrival time respecting driving hour restrictions
 * Will account for overnight stops and only driving during allowed hours
 * 
 * @param startTime - Starting timestamp
 * @param drivingHours - Hours of driving needed
 * @returns Timestamp for arrival respecting driving hours
 */
function calculateTimeRestrictedArrival(startTime: Date, drivingHours: number): Date {
  const arrivalTime = new Date(startTime.getTime());
  let remainingHours = drivingHours;
  
  while (remainingHours > 0) {
    const currentHour = arrivalTime.getHours() + (arrivalTime.getMinutes() / 60);
    
    // If current time is outside driving window
    if (currentHour >= DRIVING_END_HOUR || currentHour < DRIVING_START_HOUR) {
      if (currentHour >= DRIVING_END_HOUR) {
        // Jump to next day's driving start
        arrivalTime.setDate(arrivalTime.getDate() + 1);
      }
      arrivalTime.setHours(DRIVING_START_HOUR, 0, 0, 0);
      continue;
    }
    
    // Calculate available hours in current driving window
    const hoursAvailableToday = DRIVING_END_HOUR - currentHour;
    
    if (remainingHours <= hoursAvailableToday) {
      // Can complete within today's driving window
      arrivalTime.setTime(arrivalTime.getTime() + remainingHours * 60 * 60 * 1000);
      remainingHours = 0;
    } else {
      // Use available hours today, then continue tomorrow
      arrivalTime.setTime(arrivalTime.getTime() + hoursAvailableToday * 60 * 60 * 1000);
      remainingHours -= hoursAvailableToday;
      
      // Skip to next day's driving window
      arrivalTime.setDate(arrivalTime.getDate() + 1);
      arrivalTime.setHours(DRIVING_START_HOUR, 0, 0, 0);
    }
  }
  
  return arrivalTime;
}

// Helper function to find the closest coordinate in the route
function findClosestCoordinateIndex(coordinates: [number, number][], target: [number, number]): number {
  let closestIndex = 0;
  let minDistance = Number.MAX_VALUE;
  
  for (let i = 0; i < coordinates.length; i++) {
    const distance = Math.sqrt(
      Math.pow(coordinates[i][0] - target[0], 2) + 
      Math.pow(coordinates[i][1] - target[1], 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }
  
  return closestIndex;
}

/**
 * Adds a duty status record to the given array
 * @param statuses - Array of duty statuses
 * @param time - Time of day (in hours, e.g. 14.5 for 2:30 PM)
 * @param status - Type of duty status
 */
function addDutyStatus(
  statuses: DutyStatus[], 
  time: number, 
  status: 'driving' | 'on-duty' | 'off-duty' | 'sleeper-berth'
): void {
  statuses.push({ hour:time, status });
}

/**
 * Adds a remark to the given array
 * @param remarks - Array of remarks
 * @param time - Time of day (in hours, e.g. 14.5 for 2:30 PM)
 * @param location - Remark text or location
 */
function addRemark(remarks: Remark[], time: number, location: string): void {
  remarks.push({ time, location });
}

// Helper function to interpolate position
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

// Helper function to get location name (simplified)
function getLocationName(location: { lat: number; lng: number }): string {
  // In a real application, this would use reverse geocoding
  return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
}

// Helper function to check if the day has changed and update logs accordingly
function checkAndUpdateDay(
  currentTime: Date,
  currentDayLog: DailyLogSheet | null,
  dailyLogs: DailyLogSheet[],
  currentDutyStatuses: DutyStatus[],
  currentRemarks: Remark[],
  stops: Stop[],
  currentPosition: number
): void {
  const newDate = currentTime.toISOString().split('T')[0];
  
  if (currentDayLog && currentDayLog.date !== newDate) {
    // Complete the current day's log
    currentDayLog.graphData.hourData = [...currentDutyStatuses];
    currentDayLog.graphData.remarks = [...currentRemarks];
    currentDayLog.totalMiles = Math.round(currentPosition);
    
    // Set end time to 11:59:59 PM
    const endOfDay = new Date(currentDayLog.date);
    endOfDay.setHours(23, 59, 59, 999);
    currentDayLog.endTime = endOfDay.toISOString();
    
    // Calculate total hours for the day
    const startTime = new Date(currentDayLog.startTime);
    currentDayLog.totalHours = (endOfDay.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    // Set certification time to end of day
    currentDayLog.certificationTime = endOfDay.toISOString();
    
    if (stops.length > 0) {
      // Use the last stop of the day as the end location
      const lastStop = stops.filter(s => 
        new Date(s.estimatedArrival).toISOString().split('T')[0] === currentDayLog?.date
      ).pop();
      
      if (lastStop) {
        currentDayLog.endLocation = `${lastStop.coordinates[1].toFixed(4)}, ${lastStop.coordinates[0].toFixed(4)}`;
        
        // Calculate end odometer (start odometer + miles driven)
        currentDayLog.endOdometer = currentDayLog.startOdometer + Math.round(currentPosition);
      }
    }
    
    // Check for HOS violations
    const drivingHours = calculateDrivingHours(currentDayLog.graphData.hourData);
    const onDutyHours = calculateOnDutyHours(currentDayLog.graphData.hourData);
    
    if (drivingHours > 11) {
      currentDayLog.violations.push({
        type: "driving-limit",
        description: `Exceeded 11-hour driving limit (${drivingHours.toFixed(1)} hours)`
      });
    }
    
    if (onDutyHours > 14) {
      currentDayLog.violations.push({
        type: "on-duty-limit",
        description: `Exceeded 14-hour on-duty limit (${onDutyHours.toFixed(1)} hours)`
      });
    }
    
    dailyLogs.push(currentDayLog);
    
    // Reset for new day
    currentDutyStatuses = [];
    currentRemarks = [];
    
    // Initialize with off-duty for sleeper berth overnight
    addDutyStatus(currentDutyStatuses, 0, "sleeper-berth");
    
    // Create new day log
    currentDayLog = {
      date: newDate,
      driverName: "Driver Name",
      driverID: "DL12345678",
      truckNumber: "Truck-123",
      trailerNumber: "Trailer-456",
      carrier: "Sample Carrier Inc.",
      homeTerminal: "Los Angeles Terminal",
      shippingDocNumber: "BOL-789012",
      startOdometer: currentDayLog.endOdometer, // Continue from previous day
      endOdometer: 0, // Will be calculated
      startLocation: "", // Will be set based on first stop of the day
      endLocation: "",
      startTime: currentTime.toISOString(),
      endTime: "", // Will be set at end of day
      totalMiles: 0,
      totalHours: 0,
      logs: [],
      certificationTime: "",
      certificationStatus: "Uncertified",
      graphData: {
        hourData: currentDutyStatuses,
        remarks: currentRemarks
      },
      violations: []
    };
    
    // Find the first stop of the new day to set as start location
    const firstStop = stops.find(s => 
      new Date(s.estimatedArrival).toISOString().split('T')[0] === newDate
    );
    
    if (firstStop) {
      currentDayLog.startLocation = `${firstStop.coordinates[1].toFixed(4)}, ${firstStop.coordinates[0].toFixed(4)}`;
    }
  }
}

/**
 * Calculates total driving hours from duty status changes
 * Used for HOS compliance checks
 * 
 * @param dutyStatuses - Array of duty status changes
 * @returns Total driving hours
 */
function calculateDrivingHours(dutyStatuses: DutyStatus[]): number {
  let totalDrivingHours = 0;
  let lastDrivingStart = -1;
  
  // Sort by time
  const sortedStatuses = [...dutyStatuses].sort((a, b) => a.hour - b.hour);
  
  for (let i = 0; i < sortedStatuses.length; i++) {
    const status = sortedStatuses[i];
    
    if (status.status === "driving" && lastDrivingStart === -1) {
      // Start of driving period
      lastDrivingStart = status.hour;
    } else if (status.status !== "driving" && lastDrivingStart !== -1) {
      // End of driving period
      totalDrivingHours += (status.hour - lastDrivingStart);
      lastDrivingStart = -1;
    }
  }
  
  // Handle if still driving at end of day
  if (lastDrivingStart !== -1) {
    // Assume driving until end of day (24 hours)
    totalDrivingHours += (24 - lastDrivingStart);
  }
  
  return totalDrivingHours;
}

/**
 * Calculates total on-duty hours (including driving) from duty status changes
 * Used for HOS compliance checks
 * 
 * @param dutyStatuses - Array of duty status changes
 * @returns Total on-duty hours
 */
function calculateOnDutyHours(dutyStatuses: DutyStatus[]): number {
  let totalOnDutyHours = 0;
  let lastOnDutyStart = -1;
  
  // Sort by time
  const sortedStatuses = [...dutyStatuses].sort((a, b) => a.hour - b.hour);
  
  for (let i = 0; i < sortedStatuses.length; i++) {
    const status = sortedStatuses[i];
    
    if ((status.status === "driving" || status.status === "on-duty") && lastOnDutyStart === -1) {
      // Start of on-duty period
      lastOnDutyStart = status.hour;
    } else if (status.status !== "driving" && status.status !== "on-duty" && lastOnDutyStart !== -1) {
      // End of on-duty period
      totalOnDutyHours += (status.hour - lastOnDutyStart);
      lastOnDutyStart = -1;
    }
  }
  
  // Handle if still on duty at end of day
  if (lastOnDutyStart !== -1) {
    // Assume on duty until end of day (24 hours)
    totalOnDutyHours += (24 - lastOnDutyStart);
  }
  
  return totalOnDutyHours;
}

// Example of sample stops and ELD logs for testing
export const sampleStops: Stop[] = [
  {
    type: "start",
    name: "Current Location",
    coordinates: [-118.242766, 34.053691],
    duration: "0 hours",
    estimatedArrival: "2025-03-06T06:00:00.000Z"
  }
];

export const sampleEldLog: DailyLogSheet = {
  date: "2025-03-06",
  driverName: "John Doe",
  driverID: "DL12345678",
  truckNumber: "Truck-123",
  trailerNumber: "Trailer-456",
  carrier: "Sample Carrier Inc.",
  homeTerminal: "Los Angeles Terminal",
  shippingDocNumber: "BOL-789012",
  startOdometer: 120500,
  endOdometer: 120872,
  startLocation: "Los Angeles, CA",
  endLocation: "San Francisco, CA",
  startTime: "2025-03-06T06:00:00.000Z",
  endTime: "2025-03-06T23:59:59.999Z",
  totalMiles: 372,
  totalHours: 11.5,
  logs: [
    {
      date: "2025-03-06",
      startTime: "2025-03-06T06:00:00.000Z",
      endTime: "2025-03-06T06:30:00.000Z",
      status: "off-duty",
      location: "Los Angeles, CA",
      miles: 0
    },
    {
      date: "2025-03-06",
      startTime: "2025-03-06T06:30:00.000Z",
      endTime: "2025-03-06T07:00:00.000Z",
      status: "on-duty",
      location: "Los Angeles, CA",
      miles: 0
    },
    {
      date: "2025-03-06",
      startTime: "2025-03-06T07:00:00.000Z",
      endTime: "2025-03-06T14:30:00.000Z",
      status: "driving",
      location: "En Route to San Francisco",
      miles: 280
    },
    {
      date: "2025-03-06",
      startTime: "2025-03-06T14:30:00.000Z",
      endTime: "2025-03-06T15:00:00.000Z",
      status: "off-duty",
      location: "Rest Area",
      miles: 0
    },
    {
      date: "2025-03-06",
      startTime: "2025-03-06T15:00:00.000Z",
      endTime: "2025-03-06T17:30:00.000Z",
      status: "driving",
      location: "En Route to San Francisco",
      miles: 92
    },
    {
      date: "2025-03-06",
      startTime: "2025-03-06T17:30:00.000Z",
      endTime: "2025-03-06T19:00:00.000Z",
      status: "off-duty",
      location: "San Francisco, CA",
      miles: 0
    },
    {
      date: "2025-03-06",
      startTime: "2025-03-06T19:00:00.000Z",
      endTime: "2025-03-06T23:59:59.999Z",
      status: "sleeper-berth",
      location: "San Francisco, CA",
      miles: 0
    }
  ],
  certificationTime: "2025-03-07T06:30:00.000Z",
  certificationStatus: "Certified",
  graphData: {
    hourData: [
      { hour: 0, status: "off-duty" },
      { hour: 6.5, status: "on-duty" },
      { hour: 7, status: "driving" },
      { hour: 14.5, status: "off-duty" },
      { hour: 15, status: "driving" },
      { hour: 17.5, status: "off-duty" },
      { hour: 19, status: "sleeper-berth" }
    ],
    remarks: [
      { time: 6.5, location: "Pre-trip Inspection" },
      { time: 7, location: "Start Driving - Los Angeles, CA" },
      { time: 14.5, location: "Break - 30min" },
      { time: 15, location: "Resume Driving" },
      { time: 17.5, location: "Arrived at San Francisco, CA" }
    ]
  },
  violations: []
};

/**
 * Calculates the distance between two coordinates using the Haversine formula
 * 
 * @param coord1 - First coordinate pair [lng, lat]
 * @param coord2 - Second coordinate pair [lng, lat]
 * @returns Distance in miles
 */
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