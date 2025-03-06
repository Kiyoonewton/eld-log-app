// export interface GraphGridProps {
//   dutyStatuses?: {
//     time: number;
//     status: "off-duty" | "sleeper-berth" | "driving" | "on-duty" | null;
//   }[];
//   remarks?: {
//     time: number;
//     location: string;
//   }[];
// }

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
