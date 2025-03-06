"use client";
// pages/index.tsx
import React, { useState } from "react";
import Head from "next/head";
import { TripData, RouteWithStops } from "./types";
import RouteMap from "@/components/RouteMap";
import OSMLocationForm from "@/components/CityDropdown";
import { useTrip } from "@/context/TripContext";
import { useRouter } from "next/navigation";
import GraphPage from "./graph/page";
import { geoCodeData } from "./data";

const LoadingComponent = React.lazy(
  () => import("../components/LoadingComponent")
);

export default function Home() {
  const [routeData, setRouteData] = useState<RouteWithStops | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { setTripDetails } = useTrip();
  const router = useRouter();

  const gotoGraph = () => {
    router.push("/graph"); // Navigate to Page 2
  };

  const calculateRoute = async (tripData: TripData) => {
    //@ts-ignore
    setTripDetails((prev) => ({ ...prev, eldLogs:geoCodeData.eldLogs }));
    setRouteData(geoCodeData as any)
    //   setLoading(true);
    //   setError(null);
    //   try {
    //     const response = await fetch("/api/suggested-routes", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify(tripData),
    //     });

    //     if (!response.ok) {
    //       const errorData = await response.json();
    //       throw new Error(errorData.message || "Failed to calculate route");
    //     }

    //     const data = (await response.json()) as RouteWithStops;
    //     console.log('====================================');
    //     console.log(data);
    //     console.log('====================================');
    //     setRouteData(data);
    //     //@ts-ignore
    //     setTripDetails((prev) => ({ ...prev, stops: data?.stops }));
    //   } catch (err) {
    //     setError(
    //       err instanceof Error ? err.message : "An unknown error occurred"
    //     );
    //     console.error(err);
    //   } finally {
    //     setLoading(false);
    //   }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>ELD Trip Planner</title>
        <meta
          name="description"
          content="Plan truck routes with ELD log generation"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-blue-700 text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold">ELD Trip Planner</h1>
          <p className="text-blue-100">
            Plan compliant routes with automatic log generation
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <OSMLocationForm onCalculate={calculateRoute} />

            {routeData && (
              <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">Trip Summary</h2>
                <div className="text-gray-700">
                  <p className="flex justify-between py-2 border-b">
                    <span>Total Distance:</span>
                    <span className="font-medium">
                      {Math.round(routeData.totalDistance)} miles
                    </span>
                  </p>
                  <p className="flex justify-between py-2 border-b">
                    <span>Est. Driving Time:</span>
                    <span className="font-medium">
                      {Math.round(routeData.totalDuration / 3600)} hours
                    </span>
                  </p>
                  <p className="flex justify-between py-2 border-b">
                    <span>Number of Stops:</span>
                    <span className="font-medium">
                      {routeData.stops.length}
                    </span>
                  </p>
                  <p className="flex justify-between py-2">
                    <span>ELD Log Sheets:</span>
                    <span className="font-medium">
                      {routeData.eldLogs.length}
                    </span>
                  </p>
                </div>
              </div>
            )}
            {routeData && (
              <button
                onClick={gotoGraph}
                className="w-full flex items-center justify-center mt-8 px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
              >
                View ELD Logs
              </button>
            )}
          </div>

          <div className="md:col-span-2">
            {error && (
              <div className="bg-red-100 p-4 mb-4 rounded-md text-red-700 border border-red-300">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}

            {loading && (
              <LoadingComponent height={320} text="Loading ELD-graph data" />
            )}

            {routeData && !loading && (
              <div className="space-y-6">
                <RouteMap routeData={routeData} />

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Route Details</h2>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stop Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Est. Arrival
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {routeData.stops.map((stop, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${
                                  stop.type === "start"
                                    ? "bg-green-100 text-green-800"
                                    : ""
                                }
                                ${
                                  stop.type === "pickup"
                                    ? "bg-blue-100 text-blue-800"
                                    : ""
                                }
                                ${
                                  stop.type === "dropoff"
                                    ? "bg-red-100 text-red-800"
                                    : ""
                                }
                                ${
                                  stop.type === "rest"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : ""
                                }
                                ${
                                  stop.type === "fuel"
                                    ? "bg-purple-100 text-purple-800"
                                    : ""
                                }
                                ${
                                  stop.type === "overnight"
                                    ? "bg-gray-100 text-gray-800"
                                    : ""
                                }
                              `}
                              >
                                {stop.type.charAt(0).toUpperCase() +
                                  stop.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {stop.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {stop.duration}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(stop.estimatedArrival).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <GraphPage />
      </main>

      <footer className="bg-gray-100 border-t mt-12 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600 text-sm">
            ELD Trip Planner &copy; {new Date().getFullYear()} - Compliant with
            DOT Hours of Service Regulations
          </p>
        </div>
      </footer>
    </div>
  );
}
