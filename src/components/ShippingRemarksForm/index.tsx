"use client";

import { ShippingFormProps } from "./types";

const ShippingRemarksForm: React.FC<ShippingFormProps> = ({
  initialData,
  className = "",
}) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <form className="w-full max-w-7xl border-l-8 border-b-8 border-gray-900 p-6 relative">
        {/* Header */}
        <div className="absolute -top-3 left-12 bg-white px-2">
          <h2 className="text-base font-bold">Remarks</h2>
        </div>

        {/* Shipping Documents Section */}
        <div className="mt-4 pb-4 mb-5">
          <div className="font-bold text-sm mb-2">Shipping Documents:</div>

          <div className="ml-4">
            <div className="mb-3">
              <div className="w-full border-b border-gray-300 py-1 text-base font-semibold text-blue-500">
                {initialData?.documentNumber || ""}
              </div>
              <div className="text-sm">BOL or Manifest No.</div>
              <div className="text-sm">or</div>
            </div>

            <div className="mb-2">
              <div className="w-full border-b border-gray-300 py-1 text-base font-semibold text-blue-500">
                {initialData?.shipperCommodity || ""}
              </div>
              <div className="text-sm">Shipper & Commodity</div>
            </div>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="py-4 absolute -bottom-9 m-auto w-full text-base font-semibold">
          <p className="text-center">
            Enter name of place you reported and where released from work and
            when and where each change of duty occurred.
          </p>
          <p className="text-center mb-2 bg-white w-fit m-auto px-3">
            Use time standard of home terminal.
          </p>
        </div>
      </form>
    </div>
  );
};

export default ShippingRemarksForm;
