export interface GraphDataProps {
  hourData: {
    hour: number;
    status: string;
  }[];
  remarks: {
    time: number;
    location: string;
  }[];
}
