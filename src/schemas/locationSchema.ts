// schemas/locationSchema.ts
import { z } from 'zod';

// Define schema for coordinates
const CoordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number()
}).nullable();

// Define schema for location object (address + coordinates)
const LocationObjectSchema = z.object({
  address: z.string().min(1, "Address is required"),
  coordinates: CoordinatesSchema
});

// Define the main form schema
export const LocationFormSchema = z.object({
  currentLocation: LocationObjectSchema,
  pickupLocation: LocationObjectSchema,
  dropoffLocation: LocationObjectSchema,
  // Add the cycle hours field
  currentCycleHours: z.number().min(0).max(70).default(0),
  // Add estimated distance field
  estimatedDistance: z.number().min(0).default(0)
});

// Type for form data with coordinates
export type LocationFormDataWithCoordinates = z.infer<typeof LocationFormSchema>;

// A custom validator to ensure coordinates are present
export const validateLocationForm = (data: LocationFormDataWithCoordinates) => {
  const errors: Record<string, string> = {};
  
  // Check that coordinates exist for each location
  if (!data.currentLocation.coordinates) {
    errors['currentLocation.coordinates'] = "Coordinates are required for current location";
  }
  
  if (!data.pickupLocation.coordinates) {
    errors['pickupLocation.coordinates'] = "Coordinates are required for pickup location";
  }
  
  if (!data.dropoffLocation.coordinates) {
    errors['dropoffLocation.coordinates'] = "Coordinates are required for dropoff location";
  }
  
  // Check that hours are within valid ranges
  if (data.currentCycleHours < 0 || data.currentCycleHours > 70) {
    errors['currentCycleHours'] = "Cycle hours must be between 0 and 70";
  }
  
  return {
    success: Object.keys(errors).length === 0,
    errors
  };
};