"use client";
import { NewDailyLogSheet } from "@/app/types";
import React, { useState, useEffect, Suspense } from "react";
// Use dynamic import for the GraphGrid component
const GraphGrid = React.lazy(() => import("./GraphGrid"));
const LoadingComponent = React.lazy(() => import("../../LoadingComponent"));

const GraphComponent = ({ graphData }: { graphData: NewDailyLogSheet['graphData'] }) => {
  const [isClient, setIsClient] = useState(false);

  // This effect runs after the first render/paint
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {/* Render a placeholder during the first paint */}
      {!isClient ? (
        <LoadingComponent height={320} text="Loading ELD-graph data" />
      ) : (
        <Suspense
          fallback={
            <LoadingComponent height={320} text="Loading ELD-graph data" />
          }
        >
          <GraphGrid {...graphData} />
        </Suspense>
      )}

      <style jsx>{`
        .loading-placeholder {
          height: 320px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #ccc;
          background-color: #f9f9f9;
        }
      `}</style>
    </>
  );
};

export default GraphComponent;
