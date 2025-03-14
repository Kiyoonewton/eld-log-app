"use client";
import React, { useState } from "react";
import Head from "next/head";
import { TripData, RouteWithStops, NewDailyLogSheet } from "./types";
import OSMLocationForm from "@/components/CityDropdown";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { X, Download } from "lucide-react";
import GraphWrapper from "@/components/GraphComponent/components/GraphWrapper";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });

const LoadingComponent = React.lazy(
  () => import("../components/LoadingComponent")
);

export default function Home() {
  const [routeData, setRouteData] = useState<RouteWithStops | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showEldModal, setShowEldModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLog, setActiveLog] = useState<number>(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const logs = routeData?.eldLogs;
  const currentLog = logs?.[activeLog] as unknown as NewDailyLogSheet;

  const gotoGraph = () => {
    setShowEldModal(true);
  };

  const calculateRoute = async (tripData: TripData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "http://eld-kiyoonewton.duckdns.org/api/trip/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trip: tripData }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to calculate route");
      }

      const data = (await response.json()) as RouteWithStops;
      setRouteData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    const modalContent = document.getElementById('eld-modal-content');
    if (!modalContent) return;
    
    try {
      setIsGeneratingPdf(true);
      
      // Get the scrollable content area
      const contentArea = modalContent.querySelector('.flex-1.overflow-auto');
      if (!contentArea) {
        throw new Error('Could not find content area');
      }
      
      // Store original scroll position
      const originalScrollTop = contentArea.scrollTop;
      
      // Get the header and footer
      const header = modalContent.querySelector('.flex.justify-between.items-center.p-4.sm\\:p-6.border-b') as unknown as HTMLElement;
      const footer = modalContent.querySelector('.flex.justify-end.items-center.p-4.sm\\:p-6.border-t') as unknown as HTMLElement;
      
      if (!header || !footer) {
        throw new Error('Could not find header or footer');
      }
      
      // Get dimensions
      const headerHeight = header.offsetHeight;
      const footerHeight = footer.offsetHeight;
      const contentHeight = contentArea.scrollHeight;
      
      // Create a new div to hold everything
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = modalContent.offsetWidth + 'px';
      tempDiv.style.height = (headerHeight + contentHeight + footerHeight) + 'px';
      tempDiv.style.backgroundColor = 'white';
      document.body.appendChild(tempDiv);
      
      // Clone elements
      const headerClone = header.cloneNode(true);
      const contentClone = contentArea.cloneNode(true) as unknown as HTMLElement;
      const footerClone = footer.cloneNode(true);
      
      // Remove scrollable properties from content clone
      contentClone.style.overflow = 'visible';
      contentClone.style.height = 'auto';
      
      // Build full content
      tempDiv.appendChild(headerClone);
      tempDiv.appendChild(contentClone);
      tempDiv.appendChild(footerClone);
      
      // Capture the full content
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      
      // Clean up
      document.body.removeChild(tempDiv);
      
      // Reset original scroll position
      contentArea.scrollTop = originalScrollTop;
      
      // Create PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      
      // Add image to PDF
      pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, position, imgWidth, imgHeight);
      
      // Add more pages if needed
      let heightLeft = imgHeight - pageHeight;
      while (heightLeft > 0) {
        position = -pageHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download the PDF
      const date = currentLog ? new Date(currentLog.date).toLocaleDateString().replace(/\//g, '-') : 'eld-log';
      pdf.save(`eld-log-${date}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen relative ">
      <Head>
        <title>ELD Trip Planner</title>
        <meta
          name="description"
          content="Plan truck routes with ELD log generation"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Image
        src="/background.gif"
        alt="Background GIF"
        fill
        className="object-cover -z-10"
      />

      {/* Dark Overlay */}
      <div className="absolute -z-10 -inset-1 bg-black bg-opacity-55"></div>

      <header className="bg-orange-700 bg-opacity-30 text-white py-4 shadow-md ">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold">ELD Trip Planner</h1>
          <p className="text-blue-100">
            Plan compliant routes with automatic log generation
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            className="md:col-span-1"
            initial={{ x: routeData ? 0 : "100%" }}
            animate={{ x: routeData ? 0 : "100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <motion.div
              className="bg-white bg-opacity-50 p-6 rounded-lg shadow-md"
              layout
              initial={{ x: 0 }}
              animate={{
                x: 0,
                width: routeData ? "100%" : "100%",
              }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            >
              <OSMLocationForm
                onCalculate={calculateRoute}
                isRouteData={loading}
              />
            </motion.div>

            {routeData && (
              <motion.div className="mt-6 bg-white p-6 rounded-lg shadow-md">
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
              </motion.div>
            )}
            {routeData && (
              <button
                onClick={gotoGraph}
                className="w-full flex items-center justify-center mt-8 px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-orange-700 bg-opacity-30 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
              >
                View ELD Logs
              </button>
            )}
          </motion.div>

          <motion.div className="md:col-span-2">
            {error && (
              <div className="bg-red-100 p-4 mb-4 rounded-md text-red-700 border border-red-300">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}

            {routeData && loading && (
              <LoadingComponent height={320} text="Loading ELD-graph data" />
            )}

            {routeData && !loading && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                  delay: 1,
                }}
              >
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
              </motion.div>
            )}
          </motion.div>
        </div>

        <AnimatePresence>
          {showEldModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEldModal(false)}
            >
              <motion.div
                id="eld-modal-content"
                className="bg-white rounded-lg shadow-xl w-[100%] h-[100%] flex flex-col"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()} 
              >
                <div className="flex justify-between items-center p-4 sm:p-6 border-b">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-center">
                      Daily Electronic Log Sheets
                    </h2>

                    <div className="flex mt-4 overflow-x-auto pb-2 justify-center w-full">
                      {logs?.map((log, index) => (
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
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowEldModal(false)}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none rounded-full p-1 hover:bg-gray-100"
                      aria-label="Close modal"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4 sm:p-6">
                  {currentLog && <GraphWrapper logs={currentLog} />}
                </div>

                <div className="flex justify-end items-center p-4 sm:p-6 border-t">
                  <button
                    onClick={() => setShowEldModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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