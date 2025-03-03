// components/RouteMap.tsx
import React, { useEffect, useRef } from "react";
import { RouteWithStops, Stop } from "@/app/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import these into your _app.tsx or directly in the component
// Fix for default marker icons in Leaflet with Next.js
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface RouteMapProps {
  routeData: RouteWithStops | null;
}

const RouteMap: React.FC<RouteMapProps> = ({ routeData }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Create map instance
    const map = L.map(mapRef.current).setView([37.0902, -95.7129], 4);
    
    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update the map when route data changes
  useEffect(() => {
    if (!mapInstance.current || !routeData || !routeData.coordinates) return;

    // Clear previous markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Clear previous route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    // Convert coordinates to [lat, lng] format for Leaflet
    const routePoints = routeData.coordinates.map((coord) => [coord[1], coord[0]] as [number, number]);

    // Create and add route line
    routeLayerRef.current = L.polyline(routePoints, {
      color: "#3887be",
      weight: 5,
      opacity: 0.75,
    }).addTo(mapInstance.current);

    // Create custom marker icons for different stop types
    const createCustomIcon = (type: string) => {
      const color = getColorForStopType(type);
      return L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
    };

    // Add markers for all stops
    routeData.stops.forEach((stop: Stop) => {
      const icon = createCustomIcon(stop.type);
      const marker = L.marker([stop.coordinates[1], stop.coordinates[0]], { icon })
        .addTo(mapInstance.current!);

      const popupContent = `
        <h3>${stop.name}</h3>
        <p>Type: ${stop.type}</p>
        <p>Duration: ${stop.duration}</p>
        <p>Est. Arrival: ${new Date(stop.estimatedArrival).toLocaleString()}</p>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Fit map to bounds of the route
    const bounds = L.latLngBounds(routePoints);
    mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
  }, [routeData]);

  return (
    <div className="map-container">
      <div ref={mapRef} style={{ width: "100%", height: "500px" }} />
      <style jsx>{`
        .map-container {
          position: relative;
          width: 100%;
          height: 500px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

// Helper function to get color for different stop types
function getColorForStopType(type: string): string {
  switch (type) {
    case "start":
      return "#33cc33"; // green
    case "pickup":
      return "#3366ff"; // blue
    case "dropoff":
      return "#ff3300"; // red
    case "rest":
      return "#ffcc00"; // yellow
    case "fuel":
      return "#9933ff"; // purple
    case "overnight":
      return "#000000"; // black
    default:
      return "#999999"; // grey
  }
}

export default RouteMap;