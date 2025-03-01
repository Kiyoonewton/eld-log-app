import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { add, format, parseISO, differenceInMinutes } from 'date-fns';
import { DutyStatus, LogEntry, RouteSegment, Location } from './types';

/**
 * Combines Tailwind CSS classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate the haversine distance between two points
 * @param lat1 First point latitude
 * @param lon1 First point longitude
 * @param lat2 Second point latitude
 * @param lon2 Second point longitude
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Converts degrees to radians
 */
function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    date = parseISO(date);
  }
  return format(date, 'MM/dd/yyyy');
}

/**
 * Formats a time to a readable string
 */
export function formatTime(date: string | Date): string {
  if (typeof date === 'string') {
    date = parseISO(date);
  }
  return format(date, 'HH:mm');
}

/**
 * Convert route segments to log entries
 */
export function routeSegmentsToLogEntries(
  segments: RouteSegment[], 
  startTime: string
): LogEntry[] {
  let currentTime = parseISO(startTime);
  
  return segments.map(segment => {
    const status = getStatusForSegmentType(segment.type);
    const startTimeStr = currentTime.toISOString();
    
    // Calculate end time based on duration
    currentTime = add(currentTime, { minutes: segment.duration });
    const endTimeStr = currentTime.toISOString();
    
    return {
      status,
      startTime: startTimeStr,
      endTime: endTimeStr,
      location: segment.startLocation,
      remarks: segment.type === 'fuel' ? 'Fueling stop' : undefined
    };
  });
}

/**
 * Maps segment types to duty statuses
 */
function getStatusForSegmentType(type: RouteSegment['type']): DutyStatus {
  switch (type) {
    case 'drive':
      return DutyStatus.Driving;
    case 'rest':
      return DutyStatus.Sleeper;
    case 'pickup':
    case 'dropoff':
    case 'fuel':
      return DutyStatus.OnDuty;
    default:
      return DutyStatus.OffDuty;
  }
}

/**
 * Get address display for a location
 */
export function getAddressDisplay(location: Location): string {
  if (!location.address) return 'Unknown location';
  return location.address.split(',').slice(0, 2).join(',');
}

/**
 * Format duration from minutes to hours and minutes
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Calculate remaining driving hours in a day based on current cycle hours
 */
export function calculateRemainingDrivingHours(currentCycleHours: number): number {
  const maxDailyDrivingHours = 11;
  return Math.max(0, maxDailyDrivingHours - currentCycleHours);
}

/**
 * Group log entries by date
 */
export function groupEntriesByDate(entries: LogEntry[]): Record<string, LogEntry[]> {
  const grouped: Record<string, LogEntry[]> = {};
  
  entries.forEach(entry => {
    const date = formatDate(entry.startTime);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(entry);
  });
  
  return grouped;
}