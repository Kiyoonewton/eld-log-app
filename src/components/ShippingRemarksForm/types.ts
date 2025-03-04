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
  
  // Form props type
  export interface ShippingFormProps {
    initialData?: Partial<ShippingFormData>;
    className?: string;
  }