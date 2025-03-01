import { NextApiRequest, NextApiResponse } from "next";
import { geodesicDistance } from "@/utils/distance";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  const { currentLocation, pickupLocation, dropoffLocation, currentCycleHours } = req.body;

  if (!currentLocation || !pickupLocation || !dropoffLocation) {
    return res.status(400).json({ message: "Missing location data" });
  }

  // 🔹 Step 1: Calculate distances (Current → Pickup → Dropoff)
  const distanceToPickup = geodesicDistance(currentLocation, pickupLocation);
  const distanceToDropoff = geodesicDistance(pickupLocation, dropoffLocation);
  const totalDistance = distanceToPickup + distanceToDropoff;

  let stops = [];
  let milesDriven = 0;

  // 🔹 Step 2: Add stops based on Hours of Service (HOS)
  if (currentCycleHours >= 8) {
    stops.push({
      name: "Mandatory Rest Stop",
      coordinates: { latitude: 6.5113, longitude: 3.8734 }, // Example: Random rest stop
      reason: "Required after 8 hours of driving",
    });
  }

  // 🔹 Step 3: Fuel stops every ~1000 miles
  while (milesDriven + 1000 < totalDistance) {
    milesDriven += 1000;
    stops.push({
      name: "Fuel Stop",
      coordinates: { latitude: 6.5643, longitude: 3.3456 }, // Example: Random fuel stop
      reason: "Fuel stop every 1000 miles",
    });
  }

  return res.json({ stops });
}
