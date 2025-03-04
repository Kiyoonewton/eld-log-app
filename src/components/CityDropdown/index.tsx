// components/OSMLocationForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MapPin,
  Navigation,
  Truck,
  ArrowRight,
  Search,
  Loader2,
  Clock,
  AlertTriangle,
} from "lucide-react";
// Import types and schema - make sure to update your locationSchema.ts with the code I provided
import {
  LocationFormSchema,
  LocationFormDataWithCoordinates,
  validateLocationForm,
} from "@/schemas/locationSchema";

// Import the OpenStreetMap geocoding service
import { osmGeocodingService } from "@/services/geocodingServices";
import { getDistanceAndTimeOSRM } from "../CalculateTripDistance/getDistanceAndTimeOSRM";
import { useTrip } from "@/context/TripContext";
import { TripData } from "@/app/types";

// Rate limiting helper function to avoid hitting Nominatim's rate limits
const useDebounce = (value: string, delay: number = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Constants for driver hours regulations
const MAX_DAILY_HOURS = 14; // Maximum hours allowed in a day
const MAX_DRIVING_HOURS = 11; // Maximum driving hours allowed
const MAX_CYCLE_HOURS = 70; // Maximum hours in 8-day cycle (70-hour rule)

export default function OSMLocationForm({
  onCalculate,
}: {
  onCalculate: (data: TripData) => void;
}) {
  // React Hook Form with Zod integration
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors, isSubmitting },
  } = useForm<
    LocationFormDataWithCoordinates & {
      currentCycleHours: number;
    }
  >({
    resolver: zodResolver(LocationFormSchema),
    defaultValues: {
      currentLocation: { address: "", coordinates: null },
      pickupLocation: { address: "", coordinates: null },
      dropoffLocation: { address: "", coordinates: null },
      currentCycleHours: 0,
    },
  });

  // Watch form values for use in the component
  const formValues = watch();
  const currentLocationValue = watch("currentLocation.address");
  const pickupLocationValue = watch("pickupLocation.address");
  const dropoffLocationValue = watch("dropoffLocation.address");
  const currentCycleHours = watch("currentCycleHours");
  const { setTripDetails } = useTrip();

  // Calculate remaining hours
  // We'll use a standard calculation to derive daily hours from cycle hours
  // Assuming a standard workday is around 10 hours, with 7 hours of daily driving
  const estimatedDailyHours = Math.min(10, currentCycleHours % 11); // Estimate current day's hours
  const remainingDailyHours = MAX_DAILY_HOURS - estimatedDailyHours;
  const remainingDrivingHours = MAX_DRIVING_HOURS - estimatedDailyHours;
  const remainingCycleHours = MAX_CYCLE_HOURS - currentCycleHours;

  // Calculate when 34-hour reset would be complete
  const resetTime = new Date();
  resetTime.setHours(resetTime.getHours() + 34);
  const resetTimeString = resetTime.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  // Determine warning level based on remaining hours
  const getWarningLevel = (hours: number) => {
    if (hours <= 1) return "text-red-600 font-bold";
    if (hours <= 3) return "text-amber-500 font-bold";
    return "text-green-600";
  };

  // Get recommended action based on remaining hours
  const getRecommendedAction = () => {
    if (remainingCycleHours <= 10) {
      return "Recommended Action: Consider taking a 34-hour restart to reset your 70-hour cycle.";
    } else if (remainingDailyHours <= 2) {
      return "Recommended Action: Complete your current trip and take your 10-hour break.";
    }
    return "";
  };

  // Debounce search inputs to avoid excessive API calls
  const debouncedCurrentLocation = useDebounce(currentLocationValue);
  const debouncedPickupLocation = useDebounce(pickupLocationValue);
  const debouncedDropoffLocation = useDebounce(dropoffLocationValue);

  // States for UI interaction
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [geocodingInProgress, setGeocodingInProgress] = useState({
    currentLocation: false,
    pickupLocation: false,
    dropoffLocation: false,
  });

  const [suggestions, setSuggestions] = useState({
    currentLocation: [] as string[],
    pickupLocation: [] as string[],
    dropoffLocation: [] as string[],
  });

  const [activeField, setActiveField] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Fetch suggestions when debounced value changes
  useEffect(() => {
    if (debouncedCurrentLocation && activeField === "currentLocation") {
      fetchLocationSuggestions(debouncedCurrentLocation, "currentLocation");
    }
  }, [debouncedCurrentLocation]);

  useEffect(() => {
    if (debouncedPickupLocation && activeField === "pickupLocation") {
      fetchLocationSuggestions(debouncedPickupLocation, "pickupLocation");
    }
  }, [debouncedPickupLocation]);

  useEffect(() => {
    if (debouncedDropoffLocation && activeField === "dropoffLocation") {
      fetchLocationSuggestions(debouncedDropoffLocation, "dropoffLocation");
    }
  }, [debouncedDropoffLocation]);

  // Function to fetch location suggestions using OSM
  const fetchLocationSuggestions = async (query: string, field: string) => {
    if (!query.trim()) {
      setSuggestions((prev) => ({ ...prev, [field]: [] }));
      return;
    }

    try {
      const results = await osmGeocodingService.searchAddresses(query);
      setSuggestions((prev) => ({ ...prev, [field]: results }));
    } catch (error) {
      console.error(`Error fetching suggestions for ${field}:`, error);
      setSuggestions((prev) => ({ ...prev, [field]: [] }));
    }
  };

  // Convert address to coordinates using OSM
  const convertAddressToCoordinates = async (
    address: string,
    field: "currentLocation" | "pickupLocation" | "dropoffLocation"
  ) => {
    if (!address) return;

    setGeocodingInProgress((prev) => ({ ...prev, [field]: true }));

    try {
      const locationData = await osmGeocodingService.geocode(address);

      setValue(`${field}.coordinates`, locationData.coordinates);
      console.log(`Converted ${field}:`, locationData);
    } catch (error) {
      console.error(`Error geocoding ${field}:`, error);
    } finally {
      setGeocodingInProgress((prev) => ({ ...prev, [field]: false }));
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = async (
    suggestion: string,
    field: "currentLocation" | "pickupLocation" | "dropoffLocation"
  ) => {
    setValue(`${field}.address`, suggestion);
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
    await convertAddressToCoordinates(suggestion, field);
  };

  // async function fetchStops(tripData: TripDetails) {
  //   // setLoading(true);
  //   try {
  //     const res = await fetch("/api/saveTrip", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         tripData,
  //       }),
  //     });

  //     if (!res.ok) throw new Error("Failed to fetch stops");
  //     const data = await res.json();
  //     setTripDetails(tripData);
  //   } catch (error) {
  //     console.error("Error fetching stops:", error);
  //   } finally {
  //     // setLoading(false);
  //   }
  // }

  // Handle "Use My Location" with OpenStreetMap reverse geocoding
  const handleUseMyLocation = async () => {
    setIsLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const coordinates = { latitude, longitude };

            // Use reverse geocoding to get a readable address
            const locationData = await osmGeocodingService.reverseGeocode(
              coordinates
            );

            setValue("currentLocation", {
              address: locationData.address,
              coordinates: coordinates,
            });
          } catch (error) {
            console.error("Error getting location:", error);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLoading(false);

          // Show error message based on the error code
          let errorMessage = "Unable to get your location.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access was denied. Please allow location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }

          // alert(errorMessage);
        }
      );
    } else {
      // alert("Geolocation is not supported by your browser");
      setIsLoading(false);
    }
  };

  // Form submission handler
  const onSubmit = async (
    data: LocationFormDataWithCoordinates & { currentCycleHours: number }
  ) => {
    // Validate with our custom validator to ensure coordinates are present
    const validation = validateLocationForm(data);

    if (!validation.success) {
      setValidationErrors(validation.errors || {});
      return;
    }

    setValidationErrors({});
    const start = {
      latitude: Number(data.currentLocation.coordinates?.latitude.toFixed(6)),
      longitude: Number(data.currentLocation.coordinates?.longitude.toFixed(6)),
    };

    const waypoint = {
      latitude: Number(data.pickupLocation.coordinates?.latitude.toFixed(6)),
      longitude: Number(data.pickupLocation.coordinates?.longitude.toFixed(6)),
    };

    const end = {
      latitude: Number(data.dropoffLocation.coordinates?.latitude.toFixed(6)),
      longitude: Number(data.dropoffLocation.coordinates?.longitude.toFixed(6)),
    };
    const distanceAndDuration = await getDistanceAndTimeOSRM(
      start,
      waypoint,
      end
    );

    const tripData = {
      currentLocation: {
        address: data.currentLocation.address,
        coordinates: {
          latitude: Number(
            data.currentLocation.coordinates?.latitude.toFixed(6)
          ),
          longitude: Number(
            data.currentLocation.coordinates?.longitude.toFixed(6)
          ),
        },
      },
      pickupLocation: {
        address: data.pickupLocation.address,
        coordinates: {
          latitude: Number(
            data.pickupLocation.coordinates?.latitude.toFixed(6)
          ),
          longitude: Number(
            data.pickupLocation.coordinates?.longitude.toFixed(6)
          ),
        },
      },
      dropoffLocation: {
        address: data.dropoffLocation.address,
        coordinates: {
          latitude: Number(
            data.dropoffLocation.coordinates?.latitude.toFixed(6)
          ),
          longitude: Number(
            data.dropoffLocation.coordinates?.longitude.toFixed(6)
          ),
        },
      },
      currentCycleHours: data.currentCycleHours,

      // estimatedDistance: distanceAndDuration?.distance,
      // estimatedDuration: distanceAndDuration?.duration,
    };

    const tripdata: TripData = {
      currentLocation: {
        lat: Number(data.currentLocation.coordinates?.latitude.toFixed(6)),
        lng: Number(data.currentLocation.coordinates?.longitude.toFixed(6)),
      },
      pickupLocation: {
        lat: Number(data.pickupLocation.coordinates?.latitude.toFixed(6)),
        lng: Number(data.pickupLocation.coordinates?.longitude.toFixed(6)),
      },
      dropoffLocation: {
        lat: Number(data.dropoffLocation.coordinates?.latitude.toFixed(6)),
        lng: Number(data.dropoffLocation.coordinates?.longitude.toFixed(6)),
      },
      currentCycleUsed: data.currentCycleHours,
    };

    onCalculate(tripdata);

    // await fetchStops(tripData);

    const res = await fetch("/api/suggested-stops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trip: tripData }),
    });

    const trip = await res.json();

    if (res.ok) {
      // setTripId(trip.tripId);
      // alert("Trip saved successfully!");
    } else {
      // alert("Failed to save trip.");
    }

    // Format data for display in alert
    // const alertMessage = `
    //   Form submitted successfully!

    //   Current Location: ${data.currentLocation.address}
    //   Coordinates: ${data.currentLocation.coordinates?.latitude.toFixed(
    //     6
    //   )}, ${data.currentLocation.coordinates?.longitude.toFixed(6)}

    //   Pickup Location: ${data.pickupLocation.address}
    //   Coordinates: ${data.pickupLocation.coordinates?.latitude.toFixed(
    //     6
    //   )}, ${data.pickupLocation.coordinates?.longitude.toFixed(6)}

    //   Dropoff Location: ${data.dropoffLocation.address}
    //   Coordinates: ${data.dropoffLocation.coordinates?.latitude.toFixed(
    //     6
    //   )}, ${data.dropoffLocation.coordinates?.longitude.toFixed(6)}

    //   8-Day Cycle Hours Used: ${data.currentCycleHours}
    //   Remaining Cycle Time: ${(
    //     MAX_CYCLE_HOURS - data.currentCycleHours
    //   ).toFixed(1)} hours

    //   Estimated Daily Hours: ${estimatedDailyHours.toFixed(1)}
    //   Remaining Daily Time: ${remainingDailyHours.toFixed(1)} hours
    // `;

    // alert(alertMessage);

    // Here you would typically make an API call to your backend
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest(".autocomplete-container")) {
        setSuggestions({
          currentLocation: [],
          pickupLocation: [],
          dropoffLocation: [],
        });
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Driver Hours Information Box */}
      <div className="rounded-md bg-blue-50 p-4 mb-4">
        <div className="flex items-start">
          <Clock className="h-5 w-5 text-blue-400 mt-0.5 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Driver Hours Information
            </h3>
            <div className="mt-2 text-sm">
              {remainingCycleHours <= 0 || remainingDailyHours <= 0 ? (
                <div className="rounded-md bg-red-100 p-2 mb-2">
                  <div className="flex">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                    <p className="text-sm font-medium text-red-800">
                      {remainingCycleHours <= 0
                        ? "You have reached or exceeded your 70-hour limit. A 34-hour restart is required."
                        : "You have reached or exceeded your daily 14-hour limit. A 10-hour break is required."}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-blue-700 mb-1">
                    <span className="font-medium">
                      8-Day cycle (70-hour rule):
                    </span>{" "}
                    <span className={getWarningLevel(remainingCycleHours)}>
                      {remainingCycleHours.toFixed(1)} hours remaining
                    </span>
                  </p>
                  <p className="text-blue-700 mb-1">
                    <span className="font-medium">
                      Daily window (14-hour rule):
                    </span>{" "}
                    <span className={getWarningLevel(remainingDailyHours)}>
                      {remainingDailyHours.toFixed(1)} hours remaining
                    </span>
                  </p>
                  <p className="text-blue-700 mb-1">
                    <span className="font-medium">
                      Driving time (11-hour rule):
                    </span>{" "}
                    <span className={getWarningLevel(remainingDrivingHours)}>
                      {remainingDrivingHours.toFixed(1)} hours remaining
                    </span>
                  </p>

                  {remainingCycleHours <= 10 && (
                    <div className="mt-2 rounded-md bg-amber-50 p-2">
                      <p className="text-amber-800 text-xs font-medium">
                        A 34-hour restart would be complete by:{" "}
                        {resetTimeString}
                      </p>
                    </div>
                  )}

                  {getRecommendedAction() && (
                    <div className="mt-2 text-blue-800 font-medium text-xs">
                      {getRecommendedAction()}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 8-Day Cycle Hours */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Clock className="w-4 h-4 mr-2 text-purple-500" />
          Cycle Hours Used (70-hour/8-day rule)
        </label>
        <div className="relative">
          <input
            {...register("currentCycleHours", {
              valueAsNumber: true,
              min: 0,
              max: 70,
            })}
            type="number"
            step="0.5"
            min="0"
            max="70"
            placeholder="0.0"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
          />
          {errors.currentCycleHours && (
            <p className="text-xs text-red-500 mt-1">
              Please enter a value between 0 and 70 hours
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Enter the total hours you've worked in the past 8 days
          </p>
        </div>
      </div>

      {/* Current Location */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <MapPin className="w-4 h-4 mr-2 text-blue-500" />
          Current Location
        </label>
        <div className="relative autocomplete-container">
          <div className="flex">
            <div className="relative flex-grow">
              <Controller
                name="currentLocation.address"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your current location"
                    className={`w-full px-4 py-2 border ${
                      errors.currentLocation?.address
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-l-md focus:ring-blue-500 focus:border-blue-500`}
                    onChange={(e) => {
                      field.onChange(e);
                      // We'll fetch suggestions using the debounced effect
                    }}
                    onBlur={() => {
                      field.onBlur();
                      if (field.value) {
                        convertAddressToCoordinates(
                          field.value,
                          "currentLocation"
                        );
                      }
                    }}
                    onFocus={() => {
                      setActiveField("currentLocation");
                      if (field.value) {
                        fetchLocationSuggestions(
                          field.value,
                          "currentLocation"
                        );
                      }
                    }}
                  />
                )}
              />
              {geocodingInProgress.currentLocation ? (
                <Loader2 className="animate-spin absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              ) : (
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              )}
              {formValues.currentLocation.coordinates && (
                <div className="absolute -bottom-5 right-0 text-xs text-green-600">
                  ✓ Coordinates available
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4 text-gray-700" />
                  Loading...
                </span>
              ) : (
                <span className="flex items-center">
                  <Navigation className="w-4 h-4 mr-1" />
                  Use My Location
                </span>
              )}
            </button>
          </div>

          {/* Validation error */}
          {(errors.currentLocation?.address ||
            validationErrors["currentLocation.coordinates"]) && (
            <p className="text-xs text-red-500 mt-1">
              {errors.currentLocation?.address?.message ||
                validationErrors["currentLocation.coordinates"]}
            </p>
          )}

          {/* Suggestions dropdown */}
          {suggestions.currentLocation.length > 0 && (
            <ul className="absolute z-10 w-full bg-white mt-1 border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {suggestions.currentLocation.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() =>
                    handleSuggestionClick(suggestion, "currentLocation")
                  }
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                >
                  <MapPin className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                  <span className="text-sm truncate">{suggestion}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Pickup Location */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <MapPin className="w-4 h-4 mr-2 text-green-500" />
          Pickup Location
        </label>
        <div className="relative autocomplete-container">
          <div className="relative">
            <Controller
              name="pickupLocation.address"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Enter pickup address"
                  className={`w-full px-4 py-2 border ${
                    errors.pickupLocation?.address
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:ring-green-500 focus:border-green-500`}
                  onChange={(e) => {
                    field.onChange(e);
                    // We'll fetch suggestions using the debounced effect
                  }}
                  onBlur={() => {
                    field.onBlur();
                    if (field.value) {
                      convertAddressToCoordinates(
                        field.value,
                        "pickupLocation"
                      );
                    }
                  }}
                  onFocus={() => {
                    setActiveField("pickupLocation");
                    if (field.value) {
                      fetchLocationSuggestions(field.value, "pickupLocation");
                    }
                  }}
                />
              )}
            />
            {geocodingInProgress.pickupLocation ? (
              <Loader2 className="animate-spin absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            ) : (
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            )}
            {formValues.pickupLocation.coordinates && (
              <div className="absolute -bottom-5 right-0 text-xs text-green-600">
                ✓ Coordinates available
              </div>
            )}
          </div>

          {/* Validation error */}
          {(errors.pickupLocation?.address ||
            validationErrors["pickupLocation.coordinates"]) && (
            <p className="text-xs text-red-500 mt-1">
              {errors.pickupLocation?.address?.message ||
                validationErrors["pickupLocation.coordinates"]}
            </p>
          )}

          {/* Suggestions dropdown */}
          {suggestions.pickupLocation.length > 0 && (
            <ul className="absolute z-10 w-full bg-white mt-1 border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {suggestions.pickupLocation.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() =>
                    handleSuggestionClick(suggestion, "pickupLocation")
                  }
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                >
                  <MapPin className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                  <span className="text-sm truncate">{suggestion}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Dropoff Location */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Truck className="w-4 h-4 mr-2 text-red-500" />
          Dropoff Location
        </label>
        <div className="relative autocomplete-container">
          <div className="relative">
            <Controller
              name="dropoffLocation.address"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Enter dropoff address"
                  className={`w-full px-4 py-2 border ${
                    errors.dropoffLocation?.address
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:ring-red-500 focus:border-red-500`}
                  onChange={(e) => {
                    field.onChange(e);
                    // We'll fetch suggestions using the debounced effect
                  }}
                  onBlur={() => {
                    field.onBlur();
                    if (field.value) {
                      convertAddressToCoordinates(
                        field.value,
                        "dropoffLocation"
                      );
                    }
                  }}
                  onFocus={() => {
                    setActiveField("dropoffLocation");
                    if (field.value) {
                      fetchLocationSuggestions(field.value, "dropoffLocation");
                    }
                  }}
                />
              )}
            />
            {geocodingInProgress.dropoffLocation ? (
              <Loader2 className="animate-spin absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            ) : (
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            )}
            {formValues.dropoffLocation.coordinates && (
              <div className="absolute -bottom-5 right-0 text-xs text-green-600">
                ✓ Coordinates available
              </div>
            )}
          </div>

          {/* Validation error */}
          {(errors.dropoffLocation?.address ||
            validationErrors["dropoffLocation.coordinates"]) && (
            <p className="text-xs text-red-500 mt-1">
              {errors.dropoffLocation?.address?.message ||
                validationErrors["dropoffLocation.coordinates"]}
            </p>
          )}

          {/* Suggestions dropdown */}
          {suggestions.dropoffLocation.length > 0 && (
            <ul className="absolute z-10 w-full bg-white mt-1 border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {suggestions.dropoffLocation.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() =>
                    handleSuggestionClick(suggestion, "dropoffLocation")
                  }
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                >
                  <Truck className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                  <span className="text-sm truncate">{suggestion}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={
          isSubmitting || remainingCycleHours <= 0 || remainingDailyHours <= 0
        }
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
      >
        {isSubmitting ? (
          <span className="flex items-center">
            <Loader2 className="animate-spin mr-2 h-4 w-4 text-white" />
            Submitting...
          </span>
        ) : remainingCycleHours <= 0 ? (
          <>
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span>70-Hour Limit Reached - Restart Required</span>
          </>
        ) : remainingDailyHours <= 0 ? (
          <>
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span>14-Hour Limit Reached - Break Required</span>
          </>
        ) : (
          <>
            <span className="mr-2">Continue</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
