"use client";
import React, { useMemo } from "react";
import { GraphDataProps } from "./types";

const GraphGrid: React.FC<GraphDataProps> = ({ dutyStatuses, remarks }) => {
  // SVG dimensions and grid layout
  const svgWidth = 1200;
  const svgHeight = 320;
  const leftMargin = 100;
  const rightMargin = 80;
  const headerHeight = 50;
  const rowHeight = 40;
  const remarksHeight = 80;
  const gridWidth = svgWidth - leftMargin - rightMargin;
  const hourWidth = gridWidth / 24;

  // Convert time to X position (supporting fractional hours)
  const timeToX = (time: number) => leftMargin + time * hourWidth;

  // Map statuses to Y positions (center of row)
  const statusToY: Record<string, number> = {
    "off-duty": headerHeight + rowHeight / 2,
    "sleeper-berth": headerHeight + rowHeight + rowHeight / 2,
    driving: headerHeight + 2 * rowHeight + rowHeight / 2,
    "on-duty": headerHeight + 3 * rowHeight + rowHeight / 2,
  };

  // Process status data to find segments and transitions
  const { segments, transitions } = useMemo(() => {
    // Sort the status entries by time
    const sortedStatuses = [...dutyStatuses].sort((a, b) => a.time - b.time);

    const segs = [];
    const trans = [];

    // Process each pair of consecutive status entries
    for (let i = 0; i < sortedStatuses.length - 1; i++) {
      const currentEntry = sortedStatuses[i];
      const nextEntry = sortedStatuses[i + 1];

      if (currentEntry.status) {
        // Add a segment from current time to next time
        segs.push({
          status: currentEntry.status,
          startTime: currentEntry.time,
          endTime: nextEntry.time,
        });

        // Add a transition if the status changes
        if (nextEntry.status && currentEntry.status !== nextEntry.status) {
          trans.push({
            fromStatus: currentEntry.status,
            toStatus: nextEntry.status,
            time: nextEntry.time,
          });
        }
      }
    }

    // Handle the last entry (extend to 24 hours if it's before that)
    const lastEntry = sortedStatuses[sortedStatuses.length - 1];
    if (lastEntry.status && lastEntry.time < 24) {
      segs.push({
        status: lastEntry.status,
        startTime: lastEntry.time,
        endTime: 24,
      });
    }

    return { segments: segs, transitions: trans };
  }, [dutyStatuses]);

  // Format time as HH:MM
  // const formatTime = (time: number) => {
  //   const hours = Math.floor(time);
  //   const minutes = Math.round((time - hours) * 60);
  //   return `${hours}:${minutes.toString().padStart(2, '0')}`;
  // };

  return (
    <div className="eld-graph-container">
      <svg
        width={svgWidth}
        height={svgHeight}
        className="grid-svg"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Black header background */}
        <rect x="0" y="0" width={svgWidth} height={headerHeight} fill="black" />

        {/* Hours header */}
        {Array.from({ length: 25 }, (_, i) => {
          if (i === 0 || i === 24) {
            // Split Mid-night into two lines
            return (
              <React.Fragment key={`hour-${i}`}>
                <text
                  x={timeToX(i)}
                  y={headerHeight / 2 - 5}
                  textAnchor="middle"
                  fill="white"
                  fontWeight="bold"
                  fontSize="14"
                >
                  Mid-
                </text>
                <text
                  x={timeToX(i)}
                  y={headerHeight / 2 + 15}
                  textAnchor="middle"
                  fill="white"
                  fontWeight="bold"
                  fontSize="14"
                >
                  night
                </text>
              </React.Fragment>
            );
          } else {
            // Regular hour numbers
            return (
              <text
                key={`hour-${i}`}
                x={timeToX(i)}
                y={headerHeight / 2 + 20}
                textAnchor="middle"
                fill="white"
                fontWeight="bold"
                fontSize="14"
              >
                {i > 12 ? i % 12 || 12 : i === 12 ? "Noon" : i}
              </text>
            );
          }
        })}

        {/* Total Hours label */}
        <text
          x={svgWidth - rightMargin / 2}
          y={headerHeight / 2 - 5}
          textAnchor="middle"
          fill="white"
          fontWeight="bold"
          fontSize="14"
        >
          Total
        </text>
        <text
          x={svgWidth - rightMargin / 2}
          y={headerHeight / 2 + 15}
          textAnchor="middle"
          fill="white"
          fontWeight="bold"
          fontSize="14"
        >
          Hours
        </text>

        {/* Grid background */}
        <rect
          x="0"
          y={headerHeight}
          width={svgWidth}
          height={svgHeight - headerHeight}
          fill="white"
        />

        {/* Row labels */}
        <text
          x={leftMargin - 10}
          y={headerHeight + rowHeight / 2}
          textAnchor="end"
          fill="#0078d4"
          fontWeight="bold"
          fontSize="12"
          dominantBaseline="middle"
        >
          Off Duty
        </text>
        <text
          x={leftMargin - 10}
          y={headerHeight + rowHeight + rowHeight / 2}
          textAnchor="end"
          fill="#0078d4"
          fontWeight="bold"
          fontSize="12"
          dominantBaseline="middle"
        >
          Sleeper Berth
        </text>
        <text
          x={leftMargin - 10}
          y={headerHeight + 2 * rowHeight + rowHeight / 2}
          textAnchor="end"
          fill="#0078d4"
          fontWeight="bold"
          fontSize="12"
          dominantBaseline="middle"
        >
          Driving
        </text>
        <text
          x={leftMargin - 10}
          y={headerHeight + 3 * rowHeight + rowHeight / 2 - 5}
          textAnchor="end"
          fill="#0078d4"
          fontWeight="bold"
          fontSize="12"
          dominantBaseline="middle"
        >
          On Duty
        </text>
        <text
          x={leftMargin - 10}
          y={headerHeight + 3 * rowHeight + rowHeight / 2 + 10}
          textAnchor="end"
          fill="#0078d4"
          fontWeight="bold"
          fontSize="12"
          dominantBaseline="middle"
        >
          (Not Driving)
        </text>
        <text
          x={leftMargin - 10}
          y={headerHeight + 4 * rowHeight + remarksHeight / 2 - 10 - 15}
          textAnchor="end"
          fill="#0078d4"
          fontWeight="bold"
          fontSize="12"
          dominantBaseline="middle"
        >
          REMARKS
        </text>

        {/* Horizontal row dividers */}
        <line
          x1="0"
          y1={headerHeight}
          x2={svgWidth}
          y2={headerHeight}
          stroke="black"
          strokeWidth="1"
        />
        {Array.from({ length: 4 }, (_, i) => (
          <line
            key={`row-divider-${i}`}
            x1="0"
            y1={headerHeight + (i + 1) * rowHeight}
            x2={svgWidth}
            y2={headerHeight + (i + 1) * rowHeight}
            stroke="black"
            strokeWidth="1"
          />
        ))}

        {/* Vertical dividers */}
        <line
          x1={leftMargin}
          y1="50"
          x2={leftMargin}
          y2={headerHeight + 4 * rowHeight + remarksHeight + 50}
          stroke="black"
          strokeWidth="1"
        />

        {/* Hour grid lines and tick marks */}
        {Array.from({ length: 25 }, (_, hour) => (
          <React.Fragment key={`grid-hour-${hour}`}>
            {/* Vertical hour line */}
            <line
              x1={timeToX(hour)}
              y1={headerHeight}
              x2={timeToX(hour)}
              y2={headerHeight + 4 * rowHeight}
              stroke="black"
              strokeWidth="1"
              strokeDasharray={hour === 0 || hour === 24 ? "none" : "1,3"}
            />

            {/* Draw tick marks for each hour on each row */}
            {Array.from({ length: 4 }, (_, row) => {
              // Only draw ticks if not at the last hour position
              if (hour < 24) {
                return (
                  <React.Fragment key={`ticks-row-${row}-hour-${hour}`}>
                    {/* Four tick marks per hour (15-minute intervals) */}
                    <line
                      x1={timeToX(hour + 0.25)}
                      y1={headerHeight + row * rowHeight}
                      x2={timeToX(hour + 0.25)}
                      y2={headerHeight + row * rowHeight + 10}
                      stroke="black"
                      strokeWidth="1"
                    />
                    <line
                      x1={timeToX(hour + 0.5)}
                      y1={headerHeight + row * rowHeight}
                      x2={timeToX(hour + 0.5)}
                      y2={headerHeight + row * rowHeight + 15}
                      stroke="black"
                      strokeWidth="1"
                    />
                    <line
                      x1={timeToX(hour + 0.75)}
                      y1={headerHeight + row * rowHeight}
                      x2={timeToX(hour + 0.75)}
                      y2={headerHeight + row * rowHeight + 10}
                      stroke="black"
                      strokeWidth="1"
                    />
                  </React.Fragment>
                );
              }
              return null;
            })}
          </React.Fragment>
        ))}

        {/* Status segments (horizontal blue lines) */}
        {segments.map((segment, index) => {
          const startX = timeToX(segment.startTime);
          const endX = timeToX(segment.endTime);
          const y = statusToY[segment.status as keyof typeof statusToY];

          return (
            <line
              key={`segment-${index}`}
              x1={startX}
              y1={y}
              x2={endX}
              y2={y}
              stroke="#0078d4"
              strokeWidth="3"
            />
          );
        })}

        {/* Transitions (vertical blue lines) */}
        {transitions.map((transition, index) => {
          const x = timeToX(transition.time);
          const y1 = statusToY[transition.fromStatus as keyof typeof statusToY];
          const y2 = statusToY[transition.toStatus as keyof typeof statusToY];

          return (
            <line
              key={`transition-${index}`}
              x1={x}
              y1={y1}
              x2={x}
              y2={y2}
              stroke="#0078d4"
              strokeWidth="3"
            />
          );
        })}

        {/* Remarks/location markers */}
        {remarks.map((remark, index) => {
          const x = timeToX(remark.time);
          const y = headerHeight + 4 * rowHeight + 30 - 15;

          return (
            <g
              key={`remark-${index}`}
              transform={`translate(${x}, ${y}) rotate(45)`}
            >
              <text
                x="0"
                y="0"
                fill="#0078d4"
                fontWeight="bold"
                fontSize="12"
                textAnchor="start"
              >
                {remark.location}
              </text>
            </g>
          );
        })}
      </svg>

      <style jsx>{`
        .eld-graph-container {
          font-family: Arial, sans-serif;
          width: 100%;
          max-width: ${svgWidth}px;
          margin: 0 auto;
        }

        .graph-title {
          color: #0078d4;
          margin-bottom: 10px;
          font-size: 16px;
          text-align: center;
        }

        .grid-svg {
          border: 2px solid #000;
          display: block;
        }
      `}</style>
    </div>
  );
};

export default GraphGrid;
