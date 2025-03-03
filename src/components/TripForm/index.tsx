// components/TripForm.tsx
import React, { useState } from 'react';
import { TripData } from '@/app/types';

interface TripFormProps {
  onCalculate: (data: TripData) => void;
  isLoading: boolean;
}

const TripForm: React.FC<TripFormProps> = ({ onCalculate, isLoading }) => {
  const [formData, setFormData] = useState<TripData>({
    currentLocation: { lat: 0, lng: 0 },
    pickupLocation: { lat: 0, lng: 0 },
    dropoffLocation: { lat: 0, lng: 0 },
    currentCycleUsed: 0
  });
  
  const [currentLocationQuery, setCurrentLocationQuery] = useState('');
  const [pickupLocationQuery, setPickupLocationQuery] = useState('');
  const [dropoffLocationQuery, setDropoffLocationQuery] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert location queries to coordinates using geocoding
    const currentCoords = await geocodeLocation(currentLocationQuery);
    const pickupCoords = await geocodeLocation(pickupLocationQuery);
    const dropoffCoords = await geocodeLocation(dropoffLocationQuery);
    
    if (!currentCoords || !pickupCoords || !dropoffCoords) {
      alert('Unable to geocode one or more locations. Please try again.');
      return;
    }
    
    const data: TripData = {
      currentLocation: currentCoords,
      pickupLocation: pickupCoords,
      dropoffLocation: dropoffCoords,
      currentCycleUsed: formData.currentCycleUsed
    };
    
    onCalculate(data);
  };
  
  const geocodeLocation = async (query: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Use Nominatim (OpenStreetMap) for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      
      if (data.length === 0) {
        alert(`Location not found: ${query}`);
        return null;
      }
      
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'currentCycleUsed') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else if (name === 'currentLocationQuery') {
      setCurrentLocationQuery(value);
    } else if (name === 'pickupLocationQuery') {
      setPickupLocationQuery(value);
    } else if (name === 'dropoffLocationQuery') {
      setDropoffLocationQuery(value);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Trip Details</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="currentLocationQuery">
            Current Location
          </label>
          <input
            type="text"
            id="currentLocationQuery"
            name="currentLocationQuery"
            value={currentLocationQuery}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="City, State or Address"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="pickupLocationQuery">
            Pickup Location
          </label>
          <input
            type="text"
            id="pickupLocationQuery"
            name="pickupLocationQuery"
            value={pickupLocationQuery}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="City, State or Address"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="dropoffLocationQuery">
            Dropoff Location
          </label>
          <input
            type="text"
            id="dropoffLocationQuery"
            name="dropoffLocationQuery"
            value={dropoffLocationQuery}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="City, State or Address"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="currentCycleUsed">
            Current Cycle Hours Used
          </label>
          <input
            type="number"
            id="currentCycleUsed"
            name="currentCycleUsed"
            value={formData.currentCycleUsed}
            onChange={handleChange}
            min="0"
            max="11"
            step="0.5"
            className="w-full p-2 border rounded"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Hours already used in your 11-hour driving limit
          </p>
        </div>
        
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded font-medium ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Calculating...' : 'Calculate Route'}
        </button>
      </form>
    </div>
  );
};

export default TripForm;