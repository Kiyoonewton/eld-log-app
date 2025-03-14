'use client'
// components/RouteMap.tsx
import React from "react";
import { RouteWithStops } from "@/app/types";
import dynamic from 'next/dynamic';

// Prevent SSR for this component
const DynamicMap = dynamic(() => import('./DynamicMap'), { ssr: false });

interface RouteMapProps {
  routeData: RouteWithStops | null;
}

const RouteMap: React.FC<RouteMapProps> = ({ routeData }) => {
  return <DynamicMap routeData={routeData} />;
};

export default RouteMap;