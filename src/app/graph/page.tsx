"use client";
import GraphComponent from "@/components/GraphComponent";
// import GraphGrid from '@/components/GraphComponent'
import React from "react";
import { graphData } from "./data";
import ShippingRemarksForm from "@/components/ShippingRemarksForm";
import { ShippingFormData } from "@/components/ShippingRemarksForm/types";

const page = () => {
  const initialData = {
    documentNumber: "BOL12345",
    shipperCommodity: "ABC Shipping Co. - Electronics",
    remarks: "we are good",
  };

  const handleSubmit = (data: ShippingFormData) => {
    console.log("Form submitted:", data);
    // Here you would typically save the data to your backend
    // e.g., using fetch or axios
  };
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
                February
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
                10
              </p>
              <p className="text-center">(day)</p>
            </span>
            <p className="font-bold">/</p>
            <span>
              <h1
                className="weight font-extrabold text-blue-500"
                style={{ borderBottom: "2px solid black", textAlign: "center" }}
              >
                2025
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
            Current Location
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
            DropOff Location
          </p>
        </span>
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          fontSize: 16,
          paddingTop: "10px",
          fontWeight: "700",
        }}
      >
        <span>
          <p style={{ border: "2px solid", textAlign: "center" }}></p>
          Total miles driving today
        </span>
        <span style={{ border: "2px solid", textAlign: "center" }}>
          Total milage today
        </span>
      </div>
      <GraphComponent graphData={graphData} />

      <ShippingRemarksForm
        onSubmit={handleSubmit}
        initialData={initialData}
        className="mb-8 mt-20"
      />
    </main>
  );
};

export default page;
