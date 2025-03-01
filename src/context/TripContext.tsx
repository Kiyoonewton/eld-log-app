'use client'

import { createContext, useContext, useState, ReactNode } from "react";
import { TripContextType, TripDetails } from "./types";

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    currentLocation: null,
    pickupLocation: null,
    dropoffLocation: null,
    currentCycleHours: 0,
  });

  return (
    <TripContext.Provider value={{ ...tripDetails, setTripDetails }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) throw new Error("useTrip must be used within a TripProvider");
  return context;
}
