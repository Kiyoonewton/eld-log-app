import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // PostgreSQL database connection

export async function POST(req: Request) {
  try {
    const { trip } = await req.json();

    // if (!trip || !selectedStops || selectedStops.length === 0) {
    //     return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    // }

    // console.log("====================================");
    // console.log(trip);
    // console.log("====================================");

    // Save trip details in the database
    const savedTrip = await prisma.trip.create({
      data: {
        currentLocation: trip.currentLocation.address,
        pickupLocation: trip.pickupLocation.address,
        dropoffLocation: trip.dropoffLocation.address,
        currentCycleHours: trip.currentCycleHours,
        estimatedDistance: trip.estimatedDistance,
        estimatedDuration: trip.estimatedDuration,
        // stops: {
        //     create: selectedStops.map((stop: any) => ({
        //         name: stop.name,
        //         latitude: stop.latitude,
        //         longitude: stop.longitude,
        //         type: stop.type, // e.g., "rest", "fuel"
        //     })),
        // },
      },
      // include: { stops: true }, // Include stops in the response
    });

    console.log('====================================');
    console.log(savedTrip);
    console.log('====================================');

    return NextResponse.json({ tripId: savedTrip.id }, { status: 201 });
  } catch (error) {
    console.error("Error saving trip:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
