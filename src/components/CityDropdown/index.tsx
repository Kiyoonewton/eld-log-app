"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, Truck } from "lucide-react";

interface Location {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export default function LocationSelector() {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [pickupQuery, setPickupQuery] = useState("");
  const [dropoffQuery, setDropoffQuery] = useState("");
  const [currentQuery, setCurrentQuery] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{
    current: Location[];
    pickup: Location[];
    dropoff: Location[];
  }>({
    current: [],
    pickup: [],
    dropoff: [],
  });

  // Mock function to get location suggestions (replace with real API)
  const fetchLocationSuggestions = async (query: string, type: "current" | "pickup" | "dropoff") => {
    if (query.length < 3) {
      setSuggestions(prev => ({ ...prev, [type]: [] }));
      return;
    }

    // Simulate API call
    setTimeout(() => {
      // Create more varied suggestions based on the input
      const queryLower = query.toLowerCase();
      
      // Use a combination of common street types and cities
      const streetTypes = ["St", "Ave", "Blvd", "Dr", "Ln", "Rd", "Way", "Pl"];
      const cities = [
        { name: "Los Angeles", state: "CA", lat: 34.0522, lng: -118.2437 },
        { name: "New York", state: "NY", lat: 40.7128, lng: -74.0060 },
        { name: "Chicago", state: "IL", lat: 41.8781, lng: -87.6298 },
        { name: "Houston", state: "TX", lat: 29.7604, lng: -95.3698 },
        { name: "Phoenix", state: "AZ", lat: 33.4484, lng: -112.0740 },
        { name: "Philadelphia", state: "PA", lat: 39.9526, lng: -75.1652 },
        { name: "San Antonio", state: "TX", lat: 29.4241, lng: -98.4936 },
        { name: "San Diego", state: "CA", lat: 32.7157, lng: -117.1611 },
        { name: "Dallas", state: "TX", lat: 32.7767, lng: -96.7970 },
        { name: "San Francisco", state: "CA", lat: 37.7749, lng: -122.4194 }
      ];
      
      // Common street names with variations
      const streetNames = [
        "Main", "Oak", "Pine", "Maple", "Cedar", "Elm", "Washington", 
        "Lincoln", "Park", "Lake", "Hill", "River", "Valley", "Forest",
        "Spring", "Sunset", "Highland", "Meadow", "Pleasant", "Franklin"
      ];
      
      // Create an array to hold our suggestions
      const mockSuggestions: Location[] = [];
      
      // Add exact match if query seems like a real address component
      if (queryLower.length > 3) {
        // If the query looks like a street number, use it directly
        if (/^\d+\s+\w+/.test(query)) {
          const randomCity = cities[Math.floor(Math.random() * cities.length)];
          mockSuggestions.push({
            address: `${query}, ${randomCity.name}, ${randomCity.state}`,
            coordinates: { lat: randomCity.lat, lng: randomCity.lng }
          });
        } 
        // If the query looks like a street name
        else {
          const matchingStreets = streetNames.filter(name => 
            name.toLowerCase().includes(queryLower) || queryLower.includes(name.toLowerCase())
          );
          
          if (matchingStreets.length > 0) {
            const randomStreet = matchingStreets[Math.floor(Math.random() * matchingStreets.length)];
            const randomCity = cities[Math.floor(Math.random() * cities.length)];
            mockSuggestions.push({
              address: `${randomStreet} ${streetTypes[Math.floor(Math.random() * streetTypes.length)]}, ${randomCity.name}, ${randomCity.state}`,
              coordinates: { lat: randomCity.lat, lng: randomCity.lng }
            });
          }
        }
      }
      
      // Generate unique suggestions
      while (mockSuggestions.length < 5) {
        const randomStreetNum = Math.floor(Math.random() * 9000) + 1000;
        const randomStreet = streetNames[Math.floor(Math.random() * streetNames.length)];
        const randomStreetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        
        const address = `${randomStreetNum} ${randomStreet} ${randomStreetType}, ${randomCity.name}, ${randomCity.state}`;
        
        // Check if this suggestion already exists
        if (!mockSuggestions.some(sugg => sugg.address === address)) {
          // Apply a small random offset to coordinates to make them unique
          const latOffset = (Math.random() - 0.5) * 0.01;
          const lngOffset = (Math.random() - 0.5) * 0.01;
          
          mockSuggestions.push({
            address,
            coordinates: { 
              lat: randomCity.lat + latOffset, 
              lng: randomCity.lng + lngOffset 
            }
          });
        }
      }
      
      // If the query itself looks like it could be an address component, prioritize it
      if (queryLower.length > 3) {
        // Create a special suggestion that incorporates the user's query directly
        const specialSuggestion = {
          address: `${query} ${streetTypes[Math.floor(Math.random() * streetTypes.length)]}, ${cities[0].name}, ${cities[0].state}`,
          coordinates: { lat: cities[0].lat, lng: cities[0].lng }
        };
        
        // Insert at beginning if not a duplicate
        if (!mockSuggestions.some(sugg => sugg.address === specialSuggestion.address)) {
          mockSuggestions.unshift(specialSuggestion);
          mockSuggestions.pop(); // Keep at max 5 suggestions
        }
      }
      
      setSuggestions(prev => ({ ...prev, [type]: mockSuggestions }));
    }, 300);
  };

  // Use browser geolocation to get current location
  const detectCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // In a real application, you would use a reverse geocoding API here
          // For this example, we'll just use the coordinates
          const mockAddress = "Your Current Location";
          
          setCurrentLocation({
            address: mockAddress,
            coordinates: { lat: latitude, lng: longitude }
          });
          setCurrentQuery(mockAddress);
          setIsLoadingLocation(false);
        } catch (error) {
          console.error("Error getting address from coordinates:", error);
          setLocationError("Failed to get your address");
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError(
          error.code === 1
            ? "Location access denied. Please enable location services."
            : "Unable to retrieve your location"
        );
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle location selection
  const handleSelectLocation = (location: Location, type: "current" | "pickup" | "dropoff") => {
    if (type === "current") {
      setCurrentLocation(location);
      setCurrentQuery(location.address);
      setSuggestions(prev => ({ ...prev, current: [] }));
    } else if (type === "pickup") {
      setPickupLocation(location);
      setPickupQuery(location.address);
      setSuggestions(prev => ({ ...prev, pickup: [] }));
    } else {
      setDropoffLocation(location);
      setDropoffQuery(location.address);
      setSuggestions(prev => ({ ...prev, dropoff: [] }));
    }
  };

  // Update suggestions when queries change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLocationSuggestions(currentQuery, "current");
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [currentQuery]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLocationSuggestions(pickupQuery, "pickup");
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [pickupQuery]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLocationSuggestions(dropoffQuery, "dropoff");
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [dropoffQuery]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold mb-4">Location Details</h2>
      
      {/* Current Location */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Current Location
        </label>
        <div className="relative">
          <div className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Enter your current location"
                className="w-full pl-10 pr-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
              />
              {suggestions.current.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {suggestions.current.map((location, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectLocation(location, "current")}
                    >
                      {location.address}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md flex items-center justify-center"
              onClick={detectCurrentLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Navigation className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        {locationError && <p className="text-red-500 text-sm">{locationError}</p>}
        {currentLocation?.coordinates && (
          <p className="text-sm text-gray-500">
            Coordinates: {currentLocation.coordinates.lat.toFixed(6)}, {currentLocation.coordinates.lng.toFixed(6)}
          </p>
        )}
      </div>
      
      {/* Pickup Location */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Pickup Location
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Enter pickup address"
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={pickupQuery}
            onChange={(e) => setPickupQuery(e.target.value)}
          />
          {suggestions.pickup.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              {suggestions.pickup.map((location, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectLocation(location, "pickup")}
                >
                  {location.address}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Dropoff Location */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Dropoff Location
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Truck className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Enter dropoff address"
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dropoffQuery}
            onChange={(e) => setDropoffQuery(e.target.value)}
          />
          {suggestions.dropoff.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              {suggestions.dropoff.map((location, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectLocation(location, "dropoff")}
                >
                  {location.address}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Summary (optional) */}
      {(currentLocation || pickupLocation || dropoffLocation) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Location Summary</h3>
          {currentLocation && (
            <div className="mb-2">
              <span className="font-medium">Current:</span> {currentLocation.address}
            </div>
          )}
          {pickupLocation && (
            <div className="mb-2">
              <span className="font-medium">Pickup:</span> {pickupLocation.address}
            </div>
          )}
          {dropoffLocation && (
            <div>
              <span className="font-medium">Dropoff:</span> {dropoffLocation.address}
            </div>
          )}
        </div>
      )}
    </div>
  );
}