export const eldData={
    "coordinates": [
        [
            -118.2423,
            34.053398
        ],
        [
            -118.241982,
            34.053745
        ],
        [
            -118.241758,
            34.053992
        ],
        [
            -118.241678,
            34.054078
        ],
        [
            -118.24159,
            34.054167
        ],
        [
            -118.241177,
            34.054616
        ],],"stops": [
  {
      "type": "start",
      "name": "Current Location",
      "coordinates": [
          -118.242766,
          34.053691
      ],
      "duration": "0 hours",
      "estimatedArrival": "2025-03-06T06:30:00.202Z"
  },
  {
      "type": "rest",
      "name": "Required 30-min break",
      "coordinates": [
          -110.463888,
          38.929198
      ],
      "duration": "30 minutes",
      "estimatedArrival": "2025-03-06T14:00:00.204Z"
  },
  {
      "type": "pickup",
      "name": "Pickup Location",
      "coordinates": [
          -107.624421,
          39.175560
      ],
      "duration": "30 minutes",
      "estimatedArrival": "2025-03-07T17:00:00.102Z"
  },
  {
      "type": "overnight",
      "name": "break after 8 hours drive",
      "coordinates": [
          -105.170871,
          39.730456
      ],
      "duration": "10 hour",
      "estimatedArrival": "2025-03-06T19:00:59.204Z"
  },
  {
      "type": "fuel",
      "name": "Fuel Stop",
      "coordinates": [
          -105.170871,
          36.730456
      ],
      "duration": "30 minutes",
      "estimatedArrival": "2025-03-07T06:30:59.204Z"
  },
  {
      "type": "rest",
      "name": "30 minute break",
      "coordinates": [
          -100.538496,
          41.053342
      ],
      "duration": "30 minutes",
      "estimatedArrival": "2025-03-07T14:00:59.204Z"
  },
  {
      "type": "overnight",
      "name": "Required 10-Hour Rest",
      "coordinates": [
          -100.538496,
          41.053342
      ],
      "duration": "10 hours",
      "estimatedArrival": "2025-03-07T19:12:59.204Z"
  },
  {
      "type": "fuel",
      "name": "Fuel Stop",
      "coordinates": [
          -105.170871,
          39.730456
      ],
      "duration": "30 minutes",
      "estimatedArrival": "2025-03-08T06:30:59.204Z"
  },
  {
      "type": "rest",
      "name": "30-Minute Break",
      "coordinates": [
          -89.689388,
          41.751277
      ],
      "duration": "30 minutes",
      "estimatedArrival": "2025-03-08T14:00:59.204Z"
  },
  {
      "type": "overnight",
      "name": "Required 10-Hour Rest",
      "coordinates": [
          -86.952481,
          41.579007
      ],
      "duration": "10 hours",
      "estimatedArrival": "2025-03-08T19:00:59.204Z"
  },
  {
      "type": "rest",
      "name": "30-Minute Scaling",
      "coordinates": [
          -79.103106,
          41.170939
      ],
      "duration": "30 minutes",
      "estimatedArrival": "2025-03-09T06:30:59.204Z"
  },
  {
      "type": "dropoff",
      "name": "Dropoff Location",
      "coordinates": [
          -74.006015,
          40.712728
      ],
      "duration": "1 hour",
      "estimatedArrival": "2025-03-09T14:06:01.855Z"
  }
],
"totalDistance": 2813.0438236986,
"totalDuration": 180583.59999999998,
"eldLogs": [
  {
      "date": "2025-03-06",
      "driverName": "John Doe",
      "truckNumber": "Truck #BOL12345",
      "startLocation": {address:""},
      "endLocation": {address:""},
      "totalMilesDrivingToday": "450 miles",
      "totalMileageToday": "520 miles",
      "licensePlate": "ABC-1234 (NY)",
      "shipperCommodity": "ABC Shipping Co. - Electronics",
      "remarks": "we are good",
"officeAddress": "1234 Business Rd, Suite 100  Dallas, TX 75201",
"homeAddress": "5678 Industrial Ave Houston, TX 77001",
      "graphData": {
          "hourData": [
              {
                  "hour": 0,
                  "status": "off-duty"
              },
              {
                  "hour": 6.5,
                  "status": "on-duty"
              },
              {
                  "hour": 7,
                  "status": "driving"
              },
              {
                  "hour": 14.5,
                  "status": "off-duty"
              },
              {
                  "hour": 15,
                  "status": "driving"
              },
              {
                  "hour": 17,
                  "status": "on-duty"
              },
              {
                  "hour": 17.5,
                  "status": "driving"
              },
              {
                  "hour": 18,
                  "status": "on-duty"
              },
              {
                  "hour": 18.5,
                  "status": "driving"
              },
              {
                  "hour": 19,
                  "status": "off-duty"
              },
              {
                  "hour": 21,
                  "status": "sleeper-berth"
              },
          ], remarks: [
              { time: 6.5, location: "Pre trip", },
              { time: 7, location: "Richmond, VA" },
              { time: 14.5, location: "Break - 30min" },
              { time: 15, location: "Baltimore, MD" },
              { time: 17, location: "pickup" },
              { time: 17.5, location: "Cherry Hill, NJ" },
              { time: 18, location: "Fueling" },
              { time: 18.5, location: "Newark" },
              { time: 19, location: "Resting" },
              { time: 21, location: "New Orleans" },
            ],
      }
  },
  {
      "date": "2025-03-07",
      "driverName": "John Doe",
      "truckNumber": "Truck #BOL12345",
      "startLocation": {address:""},
      "endLocation": {address:""},

      "totalMilesDrivingToday": "450 miles",
      "totalMileageToday": "520 miles",
      "licensePlate": "ABC-1234 (NY)",

      "shipperCommodity": "ABC Shipping Co. - Electronics",
      "remarks": "we are good",
"officeAddress": "1234 Business Rd, Suite 100  Dallas, TX 75201",
"homeAddress": "5678 Industrial Ave Houston, TX 77001",
      "graphData": {
          "hourData": [
              {
                  "hour": 0,
                  "status": "sleeper-berth"
              },
              {
                  "hour": 6.5,
                  "status": "on-duty"
              },
              {
                  "hour": 7,
                  "status": "driving"
              },
              {
                  "hour": 14.5,
                  "status": "off-duty"
              },
              {
                  "hour": 15,
                  "status": "driving"
              },
              {
                  "hour": 18,
                  "status": "on-duty"
              },
              {
                  "hour": 18.5,
                  "status": "driving"
              },
              {
                  "hour": 19,
                  "status": "off-duty"
              },
              {
                  "hour": 21,
                  "status": "sleeper-berth"
              },
          ],remarks: [
              { time: 6.5, location: "Start Check" },
              { time: 7, location: "Charlottesville, VA" },
              { time: 14.5, location: "Break - 30min" },
              { time: 15, location: "Philadelphia, PA" },
              { time: 18, location: "Refueling" },
              { time: 18.5, location: "Jersey City, NJ" },
              { time: 19, location: "Break Stop" },
              { time: 21, location: "Atlanta, GA" },
            ],
      }
  },
  {
      "date": "2025-03-08",
      "driverName": "John Doe",
      "truckNumber": "Truck #BOL12345",
      "startLocation": {address:""},
      "endLocation": {address:""},

      "totalMilesDrivingToday": "450 miles",
      "totalMileageToday": "520 miles",
      "licensePlate": "ABC-1234 (NY)",

      "shipperCommodity": "ABC Shipping Co. - Electronics",
      "remarks": "we are good",
"officeAddress": "1234 Business Rd, Suite 100  Dallas, TX 75201",
"homeAddress": "5678 Industrial Ave Houston, TX 77001",
      "graphData": {
         "hourData": [
              {
                  "hour": 0,
                  "status": "sleeper-berth"
              },
              {
                  "hour": 6.5,
                  "status": "on-duty"
              },
              {
                  "hour": 7,
                  "status": "driving"
              },
              {
                  "hour": 14.5,
                  "status": "off-duty"
              },
              {
                  "hour": 15,
                  "status": "driving"
              },
              {
                  "hour": 18,
                  "status": "on-duty"
              },
              {
                  "hour": 18.5,
                  "status": "driving"
              },
              {
                  "hour": 19,
                  "status": "off-duty"
              },
              {
                  "hour": 21,
                  "status": "sleeper-berth"
              },
          ],remarks: [
              { time: 6.5, location: "Initial Inspection" },
              { time: 7, location: "Roanoke, VA" },
              { time: 14.5, location: "Rest Stop - 30min" },
              { time: 15, location: "Trenton, NJ" },
              { time: 18, location: "Gas Stop" },
              { time: 18.5, location: "Staten Island, NY" },
              { time: 19, location: "Layover" },
              { time: 21, location: "Birmingham, AL" },
            ],
      }
  },
  {
      "date": "2025-03-09",
      "driverName": "John Doe",
      "truckNumber": "Truck #BOL12345",
      "startLocation": {address:""},
      "endLocation": {address:""},

      "totalMilesDrivingToday": "450 miles",
      "totalMileageToday": "520 miles",
      "licensePlate": "ABC-1234 (NY)",

      "shipperCommodity": "ABC Shipping Co. - Electronics",
      "remarks": "we are good",
"officeAddress": "1234 Business Rd, Suite 100  Dallas, TX 75201",
"homeAddress": "5678 Industrial Ave Houston, TX 77001",
      "graphData": {
          "hourData": [
              {
                  "hour": 0,
                  "status": "sleeper-berth"
              },
              {
                  "hour": 6.5,
                  "status": "on-duty"
              },
              {
                  "hour": 7,
                  "status": "driving"
              },
              {
                  "hour": 14.5,
                  "status": "on-duty"
              },
              {
                  "hour": 15,
                  "status": "off-duty"
              },
          ],remarks: [
              { time: 6.5, location: "Initial Inspection" },
              { time: 7, location: "Roanoke, VA" },
              { time: 14.5, location: "Drop-off" },
              { time: 15, location: "Trenton, NJ" },
            ],
      }
  },
  
  
]}