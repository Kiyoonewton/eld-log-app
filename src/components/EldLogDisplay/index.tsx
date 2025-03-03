// components/EldLogDisplay.tsx
import { DailyLogSheet } from '@/app/types';
import React, { useState } from 'react';

interface EldLogDisplayProps {
  logs: DailyLogSheet[];
}

const EldLogDisplay: React.FC<EldLogDisplayProps> = ({ logs }) => {
  const [activeLog, setActiveLog] = useState<number>(0);
  
  if (!logs.length) return null;
  
  const currentLog = logs[activeLog];
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-50 p-4 border-b">
        <h2 className="text-xl font-semibold">Daily Electronic Log Sheets</h2>
        
        <div className="flex mt-4 overflow-x-auto pb-2">
          {logs.map((log, index) => (
            <button
              key={index}
              onClick={() => setActiveLog(index)}
              className={`px-4 py-2 rounded-md mr-2 text-sm font-medium whitespace-nowrap
                ${activeLog === index 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {new Date(log.date).toLocaleDateString()}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Driver Information</h3>
            <div className="bg-gray-50 p-3 rounded border">
              <p><span className="font-medium">Date:</span> {new Date(currentLog.date).toLocaleDateString()}</p>
              <p><span className="font-medium">Driver:</span> {currentLog.driverName}</p>
              <p><span className="font-medium">Truck #:</span> {currentLog.truckNumber}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Trip Summary</h3>
            <div className="bg-gray-50 p-3 rounded border">
              <p><span className="font-medium">Start:</span> {currentLog.startLocation}</p>
              <p><span className="font-medium">End:</span> {currentLog.endLocation}</p>
              <p><span className="font-medium">Total Miles:</span> {currentLog.totalMiles}</p>
            </div>
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-2">ELD Graph</h3>
        <div className="bg-gray-50 p-4 rounded border mb-6 overflow-x-auto">
          {/* ELD Graph Visualization */}
          <div className="min-w-[800px]">
            {/* Hour labels */}
            <div className="flex border-b">
              <div className="w-16 flex-shrink-0"></div>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex-1 text-center text-xs font-medium py-1">
                  {i.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
            
            {/* Status rows */}
            {['off-duty', 'sleeper', 'driving', 'on-duty'].map((status) => (
              <div key={status} className="flex border-b last:border-b-0">
                <div className="w-16 flex-shrink-0 text-xs font-medium py-2 px-2">
                  {status === 'off-duty' ? 'OFF' : 
                   status === 'sleeper' ? 'SB' :
                   status === 'driving' ? 'D' : 'ON'}
                </div>
                {currentLog.graphData.hourData.map((hour, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 border-r last:border-r-0 py-2
                      ${hour.status === status ? getStatusColor(status) : ''}`}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-2">Duty Status Log</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miles</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentLog.logs.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(entry.startTime).toLocaleTimeString()} - {new Date(entry.endTime).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(entry.status)}`}>
                      {getStatusLabel(entry.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.miles.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper functions for styling
function getStatusColor(status: string): string {
  switch(status) {
    case 'off-duty': return 'bg-green-200';
    case 'sleeper': return 'bg-blue-200';
    case 'driving': return 'bg-red-200';
    case 'on-duty': return 'bg-yellow-200';
    default: return '';
  }
}

function getStatusBadgeColor(status: string): string {
  switch(status) {
    case 'off-duty': return 'bg-green-100 text-green-800';
    case 'sleeper': return 'bg-blue-100 text-blue-800';
    case 'driving': return 'bg-red-100 text-red-800';
    case 'on-duty': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getStatusLabel(status: string): string {
  switch(status) {
    case 'off-duty': return 'Off Duty';
    case 'sleeper': return 'Sleeper Berth';
    case 'driving': return 'Driving';
    case 'on-duty': return 'On Duty (Not Driving)';
    default: return status;
  }
}

export default EldLogDisplay;