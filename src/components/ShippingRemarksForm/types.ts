// Shipping form related types
export interface ShippingFormData {
    documentNumber: string;
    shipperCommodity: string;
    remarks: string;
  }
  
  // You can extend with other shipping related types as needed
  export interface ShipmentDetails {
    shipmentId: string;
    origin: string;
    destination: string;
    status: 'pending' | 'in-transit' | 'delivered';
    createdAt: Date;
    remarks?: ShippingFormData;
  }

  export interface shippingData {
    documentNumber: string;
    shipperCommodity: string;
    remarks: string;
    licensePlate: string;
    totalMilesDrivingToday: string;
    totalMileageToday: string;
    carrierName: string;
    officeAddress: string;
    homeAddress: string;
}
  
  // Form props type
  export interface ShippingFormProps {
    shippingData: Partial<shippingData>;
    className?: string;
  }