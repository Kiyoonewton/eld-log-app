export interface DriverHoursData {
  eightDayRule: {
    hoursOn7Days: number;
    hoursAvailableTomorrow: number;
    hoursOn5Days: number;
  };
  sevenDayRule: {
    hoursOn8Days: number;
    hoursAvailableTomorrow: number;
    hoursOn7Days: number;
  };
  hoursAvailable?: number;
}

export interface DriverHoursGridProps {
  driversData: DriverHoursData;
  className?: string;
}
