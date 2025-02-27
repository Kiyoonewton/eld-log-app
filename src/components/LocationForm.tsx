// components/LocationForm.tsx
'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { MapPin, Navigation, Truck, ArrowRight } from 'lucide-react';
import { LocationFormData } from '@/types/location';

export default function LocationForm() {
  const [formData, setFormData] = useState<LocationFormData>({
    currentLocation: '',
    pickupLocation: '',
    dropoffLocation: ''
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as keyof LocationFormData]: value
    }));
  };

  const handleUseMyLocation = async () => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // In a real app, you would use a reverse geocoding service
            // to convert coordinates to an address
            const { latitude, longitude } = position.coords;
            
            // Simulating address lookup (replace with actual API call)
            setTimeout(() => {
              setFormData(prev => ({
                ...prev,
                currentLocation: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
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
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Location Details</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Location */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
            Current Location
          </label>
          <div className="flex">
            <input
              type="text"
              name="currentLocation"
              value={formData.currentLocation}
              onChange={handleInputChange}
              placeholder="Enter your current location"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
        </div>

        {/* Pickup Location */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 mr-2 text-green-500" />
            Pickup Location
          </label>
          <input
            type="text"
            name="pickupLocation"
            value={formData.pickupLocation}
            onChange={handleInputChange}
            placeholder="Enter pickup address"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Dropoff Location */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Truck className="w-4 h-4 mr-2 text-red-500" />
            Dropoff Location
          </label>
          <input
            type="text"
            name="dropoffLocation"
            value={formData.dropoffLocation}
            onChange={handleInputChange}
            placeholder="Enter dropoff address"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          />
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
    </div>
  );
}