import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // PostgreSQL database connection
import { fetchRoute } from "@/lib/osm";
import { Location } from "@/context/types";
import { selectedStops } from "./helper";

export async function POST(req: Request) {
  try {
    const { trip } = await req.json();

    // if (!trip || !selectedStops || selectedStops.length === 0) {
    //     return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    // }

    // Save trip details in the database
    const {
      currentLocation,
      pickupLocation,
      dropoffLocation,
    }: {
      currentLocation: Location;
      pickupLocation: Location;
      dropoffLocation: Location;
    } = trip;

    if (!currentLocation || !pickupLocation || !dropoffLocation) {
      return NextResponse.json(
        { error: "Missing required locations" },
        { status: 400 }
      );
    }

    const stopsData = await selectedStops(
      currentLocation,
      pickupLocation,
      dropoffLocation
    );

    const savedTrip = await prisma.trip.create({
      data: {
        currentLocation: trip.currentLocation.address,
        pickupLocation: trip.pickupLocation.address,
        dropoffLocation: trip.dropoffLocation.address,
        currentCycleHours: trip.currentCycleHours,
        estimatedDistance: trip.estimatedDistance,
        estimatedDuration: trip.estimatedDuration,
        stops: {
          create: stopsData?.stops?.length
            ? stopsData.stops.map((stop: any) => ({
                name: stop.name,
                latitude: stop.latitude,
                longitude: stop.longitude,
                type: stop.type,
              }))
            : [],
        },
      },
      include: { stops: true },
    });

    return NextResponse.json({ tripId: savedTrip.id }, { status: 201 });
  } catch (error) {
    // console.log("Error saving trip:", error);
    return NextResponse.json(
      { error},
      { status: 500 }
    );
  }
}
