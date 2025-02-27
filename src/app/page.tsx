import LocationSelector from "@/components/CityDropdown";
import EnhancedLocationForm from "@/components/CityDropdown";
import CityDropdown from "@/components/CityDropdown";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative w-full h-screen">
      {/* Background GIF */}
      <Image
        src="/background.gif"
        alt="Background GIF"
        fill
        className="object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-55"></div>

      {/* Centered Form */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4">
            Plan Your Trip 🚛{" "}
          </h2>
          <div className="max-w-md mx-auto">
            {/* Use the enhanced form with autocomplete by default */}
            <EnhancedLocationForm />

            {/* Uncomment below and comment out the EnhancedLocationForm to use the basic form */}
            {/* <LocationForm /> */}
          </div>{" "}
        </div>
      </div>
    </div>
  );
}
