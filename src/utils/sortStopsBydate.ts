import { Stop } from "@/app/types";

export function sortStopsByArrival(stops: Stop[]): Stop[] {
  return [...stops].sort((a, b) => 
    new Date(a.estimatedArrival).getTime() - new Date(b.estimatedArrival).getTime()
  );
}
