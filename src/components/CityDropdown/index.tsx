// EnhancedLocationForm.tsx
'use client';

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { MapPin, Navigation, Truck, ArrowRight, Search } from 'lucide-react';

interface LocationFormData {
  currentLocation: string;
  pickupLocation: string;
  dropoffLocation: string;
}

type LocationField = keyof LocationFormData;

interface LocationSuggestions {
  currentLocation: string[];
  pickupLocation: string[];
  dropoffLocation: string[];
}

export default function EnhancedLocationForm() {
  const [formData, setFormData] = useState<LocationFormData>({
    currentLocation: '',
    pickupLocation: '',
    dropoffLocation: ''
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestions>({
    currentLocation: [],
    pickupLocation: [],
    dropoffLocation: []
  });
  const [activeField, setActiveField] = useState<LocationField | null>(null);

  const autoCompleteRefs = {
    currentLocation: useRef<HTMLInputElement>(null),
    pickupLocation: useRef<HTMLInputElement>(null),
    dropoffLocation: useRef<HTMLInputElement>(null)
  };

  // Mock function to simulate location autocomplete API
  const fetchLocationSuggestions = (query: string, field: LocationField) => {
    // In a real app, you would call a location service API like Google Places
    if (!query.trim()) {
      setSuggestions(prev => ({ ...prev, [field]: [] }));
      return;
    }

    // Simulate API delay
    setTimeout(() => {
      const locations = [
        "123 Main Street, New York, NY",
        "456 Broadway Avenue, Los Angeles, CA",
        "789 Michigan Avenue, Chicago, IL",
        "101 Market Street, San Francisco, CA",
        "202 Peachtree Street, Atlanta, GA",
        "303 Bourbon Street, New Orleans, LA",
        "404 Las Vegas Boulevard, Las Vegas, NV",
        "505 Beale Street, Memphis, TN",
        "606 Ocean Drive, Miami Beach, FL",
        "707 Newbury Street, Boston, MA",
        "808 King Street, Charleston, SC",
        "909 Pennsylvania Avenue, Washington DC",
        "1010 Rodeo Drive, Beverly Hills, CA",
        "1111 Pike Place, Seattle, WA",
        "1212 Sixth Street, Austin, TX",
        "1313 Canal Street, New York, NY",
        "1414 Lombard Street, San Francisco, CA",
        "1515 Fremont Street, Las Vegas, NV",
        "1616 Melrose Avenue, Los Angeles, CA",
        "1717 Royal Street, New Orleans, LA"
      ];
      
      // Filter based on query
      const mockSuggestions = locations
        .filter(location => location.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      
      setSuggestions(prev => ({ ...prev, [field]: mockSuggestions }));
    }, 300);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as LocationField;
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Fetch suggestions for the changed field
    fetchLocationSuggestions(value, fieldName);
  };

  const handleSuggestionClick = (suggestion: string, field: LocationField) => {
    setFormData(prev => ({
      ...prev,
      [field]: suggestion
    }));
    setSuggestions(prev => ({ ...prev, [field]: [] }));
  };

  const handleUseMyLocation = async () => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // In a real app, you would use a reverse geocoding service
            const { latitude, longitude } = position.coords;
            
            // Simulating address lookup (replace with actual API call)
            setTimeout(() => {
              setFormData(prev => ({
                ...prev,
                currentLocation: `Your location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              }));
              setIsLoading(false);
            }, 1000);
            
          } catch (error) {
            console.error("Error getting location:", error);
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
    alert(`Form submitted!\nCurrent: ${formData.currentLocation}\nPickup: ${formData.pickupLocation}\nDropoff: ${formData.dropoffLocation}`);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.autocomplete-container')) {
        setSuggestions({
          currentLocation: [],
          pickupLocation: [],
          dropoffLocation: []
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle field focus
  const handleFocus = (field: LocationField) => {
    setActiveField(field);
    if (formData[field]) {
      fetchLocationSuggestions(formData[field], field);
    }
  };

  return (

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Location */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
            Current Location
          </label>
          <div className="relative autocomplete-container">
            <div className="flex">
              <div className="relative flex-grow">
                <input
                  type="text"
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('currentLocation')}
                  placeholder="Enter your current location"
                  ref={autoCompleteRefs.currentLocation}
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isLoading}
                className="flex items-center justify-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
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
            
            {/* Suggestions dropdown */}
            {suggestions.currentLocation.length > 0 && (
              <ul className="absolute z-10 w-full bg-white mt-1 border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {suggestions.currentLocation.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion, 'currentLocation')}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  >
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    {suggestion}
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
              <input
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleInputChange}
                onFocus={() => handleFocus('pickupLocation')}
                placeholder="Enter pickup address"
                ref={autoCompleteRefs.pickupLocation}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            {/* Suggestions dropdown */}
            {suggestions.pickupLocation.length > 0 && (
              <ul className="absolute z-10 w-full bg-white mt-1 border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {suggestions.pickupLocation.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion, 'pickupLocation')}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  >
                    <MapPin className="w-4 h-4 mr-2 text-green-500" />
                    {suggestion}
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
              <input
                type="text"
                name="dropoffLocation"
                value={formData.dropoffLocation}
                onChange={handleInputChange}
                onFocus={() => handleFocus('dropoffLocation')}
                placeholder="Enter dropoff address"
                ref={autoCompleteRefs.dropoffLocation}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            {/* Suggestions dropdown */}
            {suggestions.dropoffLocation.length > 0 && (
              <ul className="absolute z-10 w-full bg-white mt-1 border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {suggestions.dropoffLocation.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion, 'dropoffLocation')}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  >
                    <Truck className="w-4 h-4 mr-2 text-red-500" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <span className="mr-2">Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
  );
}