import React, { FC } from "react";

const DriverLogDisplay: FC<any> = ({ initialData }) => {
  return (
    <div className="w-100 mx-auto pt-12 pb-5">
      {/* First row - Total Miles and Total Mileage */}
      <div className="grid grid-cols-2 mb-4">
        <div className="flex">
          <div className="flex-1 mr-2">
            <div className=" border-black border-2 p-2 h-10 text-lg text-center text-blue-500">
              {initialData.totalMilesDrivingToday}
            </div>
            <div className="text-center text-sm mt-1">
              Total Miles Driving Today
            </div>
          </div>
          <div className="flex-1 mr-2">
            <div className="border-2 border-black  p-2 h-10 text-lg text-center text-blue-500">
              {initialData.totalMileageToday}
            </div>
            <div className="text-center text-sm mt-1">Total Mileage Today</div>
          </div>
        </div>
        <div className="flex-grow flex-col ml-2">
          <div className="border-b-2 border-black p-2 h-10 text-lg text-center text-blue-500">
            {initialData.carrierName}
          </div>
          <div className="text-center text-sm mt-1">
            Name of Carrier or Carriers
          </div>
        </div>
      </div>

      {/* Second row - Truck/Tractor and Main Office */}
      <div className="flex">
        <div className="flex-1 mr-2">
          <div className="border-2 border-black p-2 h-10 text-lg text-center text-blue-500">
            {initialData.licensePlate}
          </div>
          <div className="text-center text-sm mt-1">
            Truck/Tractor and Trailer Numbers or License Plate(s)/State (show
            each unit)
          </div>
        </div>
        <div className="flex-1 flex-col ml-2">
          <div className="border-b-2 border-black p-2 text-lg text-center text-blue-500">
            {initialData.officeAddress}
          </div>
          <div className="text-sm mt-0 text-center">Main Office Address</div>
          <div className="border-b-2 border-black p-2 mt-2 text-lg text-center text-blue-500">
            {initialData.homeAddress}
          </div>
          <div className="text-sm mt-0 text-center">Home Terminal Address</div>
        </div>
      </div>
    </div>
  );
};

export default DriverLogDisplay;
