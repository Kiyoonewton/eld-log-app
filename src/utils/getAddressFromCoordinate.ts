export const getAddressFromCoords = async (lat: number, lng: number) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('====================================');
    console.log(data);
    console.log('====================================');
    if (data.status === "OK") {
      return data.results[0].formatted_address;
    } else {
      throw new Error(`Geocoding failed: ${data.status}`);
    }
  } catch (error) {
    console.error("Error getting address:", error);
    return null;
  }
};
