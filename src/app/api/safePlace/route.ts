import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Ensure this is set up correctly

export async function POST(req: Request) {
  try {
    const { trip } = await req.json();
    const { currentLocation, pickupLocation, dropoffLocation, currentCycleHours } = trip;

    const savedTrip = await db.trip.create({
      data: {
        currentLocation: JSON.stringify(currentLocation),
        pickupLocation: JSON.stringify(pickupLocation),
        dropoffLocation: JSON.stringify(dropoffLocation),
        currentCycleHours,
      },
    });

    return NextResponse.json({ success: true, tripId: savedTrip.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save trip" }, { status: 500 });
  }
}
