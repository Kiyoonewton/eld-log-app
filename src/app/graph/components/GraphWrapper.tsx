"use client";
import React from "react";
import ShippingRemarksForm from "@/components/ShippingRemarksForm";
import DriverHoursGrid from "@/components/DriverHoursGrid";
import DriverLogDisplay from "@/components/DriverLogData";
import GraphComponent from "./GraphComponent";
import { NewDailyLogSheet } from "@/app/types";

const GraphWrapper = ({ logs }: { logs: NewDailyLogSheet }) => {
  const shippingData = {
    documentNumber: logs.truckNumber,
    carrier: logs.carrier,
    remarks: logs.remarks,
    licensePlate: logs.licensePlate,
    totalMilesDrivingToday: logs.totalMilesDrivingToday,
    totalMileageToday: logs.totalMileageToday,
    carrierName: logs.driverName,
    officeAddress: logs.officeAddress,
    homeAddress: logs.homeAddress,
  };

  const date = new Date(logs.date);

  return (
    <main style={{ width: "100%", maxWidth: "70%", margin: "80px auto" }}>
      <div className="flex justify-between">
        <div className="w-fit">
          <h1 className="text-3xl weight font-extrabold">Drivers Daily Logs</h1>
          <p className="text-center">(24 hours)</p>
        </div>
        <div className="flex gap-8">
          <div className="flex">
            <span>
              <p
                className="weight font-extrabold text-blue-500"
                style={{ borderBottom: "2px solid black", paddingRight: "5px" }}
              >
                {date.toLocaleString("en-US", { month: "long" })}
              </p>
              <p className="text-center">(month)</p>
            </span>
            <p className="font-bold">/</p>
            <span>
              <p
                className="weight font-extrabold text-blue-500"
                style={{
                  borderBottom: "2px solid black",
                  textAlign: "center",
                  padding: "0 10px",
                }}
              >
                {date.getDate()}
              </p>
              <p className="text-center">(day)</p>
            </span>
            <p className="font-bold">/</p>
            <span>
              <h1
                className="weight font-extrabold text-blue-500"
                style={{ borderBottom: "2px solid black", textAlign: "center" }}
              >
                {date.getFullYear()}
              </h1>
              <p className="text-center">(year)</p>
            </span>
          </div>
          <span>
            <h1 className="weight font-extrabold text-left">
              Original - file at home terminal
            </h1>
            <p className="text-left">
              Duplicate - Driver retains in his/her possession for 8 days
            </p>
          </span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          fontSize: 16,
          paddingTop: "20px",
          fontWeight: "700",
        }}
      >
        <span
          style={{
            borderBottom: "2px solid",
            width: 500,
            textAlign: "center",
            display: "flex",
          }}
        >
          From:
          <p
            className="text-blue-500"
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "auto",
            }}
          >
            {logs.startLocation || ""}
          </p>
        </span>
        <span
          style={{
            borderBottom: "2px solid",
            width: 500,
            textAlign: "center",
            display: "flex",
          }}
        >
          To:
          <p
            className="text-blue-500"
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "auto",
            }}
          >
            {logs.endLocation || ""}
          </p>
        </span>
      </div>
      <DriverLogDisplay shippingData={shippingData} />
      {logs && <GraphComponent graphData={logs.graphData} />}

      <ShippingRemarksForm shippingData={shippingData} className="mb-8 mt-20" />
      <DriverHoursGrid
        driversData={{
          eightDayRule: {
            hoursOn7Days: 45.5,
            hoursAvailableTomorrow: 24.5,
            hoursOn5Days: 32.0,
          },
          sevenDayRule: {
            hoursOn8Days: 48.5,
            hoursAvailableTomorrow: 11.5,
            hoursOn7Days: 45.5,
          },
          hoursAvailable: 70,
        }}
      />
    </main>
  );
};

export default GraphWrapper;
