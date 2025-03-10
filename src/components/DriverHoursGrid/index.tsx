"use client";

import React from "react";
import { DriverHoursGridProps } from "./types";
import { useTrip } from "@/context/TripContext";

// Define the types for our data

const DriverHoursGrid: React.FC<DriverHoursGridProps> = ({
  driversData,
  className = "",
}) => {
    const{onDutyHoursToday} = useTrip();
  return (
    <div className={`driver-hours-grid ${className}`}>
      {/* Header Row */}
      <div className="grid grid-cols-11 gap-3 justify-bottom font-semibold">
        <span>
          <p className="">Recap:</p>
          <p>Complete at</p>
          <p>end of day</p>
        </span>
        <span className="border-b-2 border-black w-full flex items-end text-center text-blue-500 justify-center">
          {onDutyHoursToday.toFixed(2)}
        </span>
        <span>
          <p className="font-bold whitespace-nowrap">70 Hour/</p>
          <p>8 Days</p>
          <p>Driver</p>
        </span>
        <span className="border-b-2 border-black w-full flex items-end">
          A.
          <p className="text-blue-500 flex justify-center flex-1">
            {onDutyHoursToday.toFixed(2)}
          </p>
        </span>
        <span className="border-b-2 border-black w-full flex items-end">
          B.
          <p className="text-blue-500 flex justify-center flex-1">
            {onDutyHoursToday.toFixed(2)}
          </p>
        </span>
        <span className="border-b-2 border-black w-full flex items-end">
          C.
          <p className="text-blue-500 flex justify-center flex-1">
            {onDutyHoursToday.toFixed(2)}
          </p>
        </span>
        <span>
          <p className="font-bold whitespace-nowrap">60 Hour/7</p>
          <p className="whitespace-nowrap">Days Driver</p>
        </span>
        <span className="border-b-2 border-black w-full flex items-end">
          A.
          <p className="text-blue-500 flex justify-center flex-1">
          {}
          </p>
        </span>
        <span className="border-b-2 border-black w-full flex items-end">
          B.
          <p className="text-blue-500 flex justify-center flex-1">
          {}
          </p>
        </span>
        <span className="border-b-2 border-black w-full flex items-end">
          C.
          <p className="text-blue-500 flex justify-center flex-1">
            {}
          </p>
        </span>
        <span>
          <p className="font-bold">*if you take</p>
          <p>34</p>
          <p>consecutive</p>
        </span>
      </div>

      {/* Subheader Row */}
      <div className="grid grid-cols-11 gap-3 justify-bottom font-semibold">
        <span>{/* Empty cell */}</span>
        <span className="w-full">
          <p>On duty</p>
          <p>hours</p>
          <p>today.</p>
          <p>Total lines</p>
          <p>3 & 4</p>
        </span>
        <span></span>
        <span>
          <p>A. Total</p>
          <p>hours on</p>
          <p>duty last 7</p>
          <p>days</p>
          <p>including</p>
          <p>today.</p>
        </span>
        <span>
          <p>B. Total</p>
          <p>hours</p>
          <p>available</p>
          <p>tomorrow</p>
          <p>70hrs.</p>
          <p>Minus *A</p>
        </span>
        <span>
          <p>C. Total</p>
          <p>hours on</p>
          <p>duty last 5</p>
          <p>days</p>
          <p>including</p>
          <p>today.</p>
        </span>
        <span></span>
        <span>
          <p>A. Total</p>
          <p>hours on</p>
          <p>duty last 8</p>
          <p>days</p>
          <p>including</p>
          <p>today.</p>
        </span>
        <span>
          <p>B. Total</p>
          <p>hours</p>
          <p>available</p>
          <p>tomorrow</p>
          <p>60hrs.</p>
          <p>Minus *A</p>
        </span>
        <span>
          <p>C. Total</p>
          <p>hours on</p>
          <p>duty last 7</p>
          <p>days</p>
          <p>including</p>
          <p>today.</p>
        </span>
        <span>
          <p>hours off</p>
          <p>duty you</p>
          <p>have 60/70</p>
          <p>hours</p>
          <p>available</p>
        </span>
      </div>

      {/* Driver Data Rows */}
      {/* {driversData.map((driver, index) => (
        <div
          key={driver.id}
          className={`grid grid-cols-11 gap-3 py-2 ${
            index % 2 === 0 ? "bg-gray-50" : ""
          }`}
        >
          <span className="font-semibold text-center">
            {String.fromCharCode(65 + index)}.
          </span>
          <span className="text-center font-semibold">
            {driver.onDutyHoursToday}
          </span>
          <span></span>
          <span className="text-center border-b-2 border-black">
            {driver.eightDayRule.hoursOn7Days}
          </span>
          <span className="text-center border-b-2 border-black">
            {driver.eightDayRule.hoursAvailableTomorrow}
          </span>
          <span className="text-center border-b-2 border-black">
            {driver.eightDayRule.hoursOn5Days}
          </span>
          <span></span>
          <span className="text-center border-b-2 border-black">
            {driver.sevenDayRule.hoursOn8Days}
          </span>
          <span className="text-center border-b-2 border-black">
            {driver.sevenDayRule.hoursAvailableTomorrow}
          </span>
          <span className="text-center border-b-2 border-black">
            {driver.sevenDayRule.hoursOn7Days}
          </span>
          <span className="text-center border-b-2 border-black">
            {driver.hoursAvailable || 70}
          </span>
        </div>
      ))} */}

      {/* Empty rows for additional entries */}
      {/* {Array.from({ length: Math.max(0, 5 - driversData.length) }).map(
        (_, index) => (
          <div
            key={`empty-${index}`}
            className={`grid grid-cols-11 gap-3 py-2 ${
              (index + driversData.length) % 2 === 0 ? "bg-gray-50" : ""
            }`}
          >
            <span className="font-semibold text-center">
              {String.fromCharCode(65 + index + driversData.length)}.
            </span>
            <span className="text-center font-semibold"></span>
            <span></span>
            <span className="border-b-2 border-black h-8"></span>
            <span className="border-b-2 border-black h-8"></span>
            <span className="border-b-2 border-black h-8"></span>
            <span></span>
            <span className="border-b-2 border-black h-8"></span>
            <span className="border-b-2 border-black h-8"></span>
            <span className="border-b-2 border-black h-8"></span>
            <span className="border-b-2 border-black h-8"></span>
          </div>
        )
      )} */}
    </div>
  );
};

export default DriverHoursGrid;
