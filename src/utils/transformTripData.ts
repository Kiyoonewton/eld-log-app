import { DutyStatus, GraphData, NominatimResponse, Remark, TripData } from "@/types/transformData";

export async function transformTripData(tripData: TripData[]): Promise<GraphData> {
    const startTime: Date = new Date(tripData[0].estimatedArrival);
    
    const statusMapping: Record<string, DutyStatus['status']> = {
        'start': 'off-duty',
        'overnight': 'sleeper-berth',
        'rest': 'off-duty',
        'fuel': 'on-duty',
        'pickup': 'on-duty',
        'dropoff': 'on-duty'
    };

    const dutyStatuses: DutyStatus[] = [];
    const remarks: Remark[] = [];

    for (let index = 0; index < tripData.length; index++) {
        const stop: TripData = tripData[index];
        const arrivalTime: Date = new Date(stop.estimatedArrival);
        const hoursFromStart: number = (arrivalTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

        const [lon, lat]: [number, number] = stop.coordinates;
        const locationName: string = await reverseGeocode(lat, lon);

        const status: DutyStatus['status'] = statusMapping[stop.type] || 'driving';
        dutyStatuses.push({ time: hoursFromStart, status });
        remarks.push({ time: hoursFromStart, location: locationName });

        let durationHours: number = 0;
        if (stop.duration.includes('hour')) {
            durationHours = parseFloat(stop.duration.split(' ')[0]);
        } else if (stop.duration.includes('minute')) {
            durationHours = parseFloat(stop.duration.split(' ')[0]) / 60;
        }

        if (index < tripData.length - 1) {
            const nextArrival: Date = new Date(tripData[index + 1].estimatedArrival);
            const driveEndHours: number = (nextArrival.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            if (driveEndHours > hoursFromStart + durationHours) {
                dutyStatuses.push({ time: hoursFromStart + durationHours, status: 'driving' });
            }
        }
    }

    dutyStatuses.sort((a, b) => a.time - b.time);
    remarks.sort((a, b) => a.time - b.time);

    return { dutyStatuses, remarks };
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'TripPlanner/1.0 (your.email@example.com)' // Replace with your app details
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: NominatimResponse = await response.json();
        
        return data.display_name || 'Unknown Location';
    } catch (error) {
        console.error('Error in reverse geocoding:', error);
        return 'Unknown Location';
    }
}