"use client";
// components/EldLogDisplay.tsx
import GraphWrapper from "@/app/graph/components/GraphWrapper";
import React, { useState } from "react";
import { useTrip } from "@/context/TripContext";

const GraphPage = () => {
  const [activeLog, setActiveLog] = useState<number>(0);
  const { eldLogs } = useTrip();
  const logs = eldLogs;
  if (!logs?.length) return null;
  const currentLog = logs[activeLog];

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex justify-center">
        <div className="bg-gray-50 p-4 border-b">
          <h2 className="text-xl font-semibold text-center">
            Daily Electronic Log Sheets
          </h2>

          <div className="flex mt-4 overflow-x-auto pb-2">
            {logs.map((log, index) => (
              <button
                key={index}
                onClick={() => setActiveLog(index)}
                className={`px-4 py-2 rounded-md mr-2 text-sm font-medium whitespace-nowrap
                ${
                  activeLog === index
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {new Date(log.date).toLocaleDateString()}
              </button>
            ))}
          </div>
        </div>
      </div>
      {currentLog && <GraphWrapper logs={currentLog} />}
    </>
  );
};

// Helper functions for styling
function getStatusColor(status: string): string {
  switch (status) {
    case "off-duty":
      return "bg-green-200";
    case "sleeper":
      return "bg-blue-200";
    case "driving":
      return "bg-red-200";
    case "on-duty":
      return "bg-yellow-200";
    default:
      return "";
  }
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "off-duty":
      return "bg-green-100 text-green-800";
    case "sleeper":
      return "bg-blue-100 text-blue-800";
    case "driving":
      return "bg-red-100 text-red-800";
    case "on-duty":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "off-duty":
      return "Off Duty";
    case "sleeper":
      return "Sleeper Berth";
    case "driving":
      return "Driving";
    case "on-duty":
      return "On Duty (Not Driving)";
    default:
      return status;
  }
}

export default GraphPage;
