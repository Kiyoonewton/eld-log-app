// services/osmGeocodingService.ts

// Interface for coordinates
export interface Coordinates {
    latitude: number;
    longitude: number;
  }
  
  // Interface for location data that includes both address and coordinates
  export interface LocationData {
    address: string;
    coordinates: Coordinates | null;
  }
  
  /**
   * OpenStreetMap (Nominatim) geocoding service
   * This service provides geocoding and reverse geocoding using the free Nominatim API
   * 
   * Note: When using this in production, please:
   * 1. Set a proper User-Agent header with your app name and contact info
   * 2. Respect the usage policy (max 1 request per second)
   * 3. Consider setting up your own Nominatim instance for heavy usage
   * 
   * See: https://operations.osmfoundation.org/policies/nominatim/
   */
  export const osmGeocodingService = {
    // Convert address to coordinates (forward geocoding)
    geocode: async (address: string): Promise<LocationData> => {
      // Exit early if empty address
      if (!address.trim()) {
        throw new Error("Empty address provided");
      }
  
      try {
        // Encode the address for URL
        const encodedAddress = encodeURIComponent(address);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your@email.com)' // Replace with your app name and contact
          }
        });
        
        if (!response.ok) {
          throw new Error(`Geocoding failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if we got a result
        if (!data || data.length === 0) {
          return {
            address: address,
            coordinates: null
          };
        }
        
        // Get the first result
        const result = data[0];
        
        return {
          address: result.display_name || address,
          coordinates: {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon)
          }
        };
      } catch (error) {
        console.error("Error in geocoding:", error);
        // Return original address with null coordinates on error
        return {
          address: address,
          coordinates: null
        };
      }
    },
  
    // Convert coordinates to address (reverse geocoding)
    reverseGeocode: async (coordinates: Coordinates): Promise<LocationData> => {
      const { latitude, longitude } = coordinates;
      
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your@email.com)' // Replace with your app name and contact
          }
        });
        
        if (!response.ok) {
          throw new Error(`Reverse geocoding failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.display_name) {
          // If no address found, return formatted coordinates
          return {
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            coordinates
          };
        }
        
        return {
          address: data.display_name,
          coordinates
        };
      } catch (error) {
        console.error("Error in reverse geocoding:", error);
        // Return formatted coordinates on error
        return {
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          coordinates
        };
      }
    },
  
    // Search for address suggestions
    searchAddresses: async (query: string, limit: number = 5): Promise<string[]> => {
      if (!query.trim()) {
        return [];
      }
      
      try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=${limit}`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your@email.com)' // Replace with your app name and contact
          }
        });
        
        if (!response.ok) {
          throw new Error(`Address search failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract display names from results
        return data.map((item: {display_name:string}) => item.display_name);
      } catch (error) {
        console.error("Error in address search:", error);
        return [];
      }
    }
  };