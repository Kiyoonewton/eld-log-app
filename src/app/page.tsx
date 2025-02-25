import LocationSelector from "@/components/CityDropdown";
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
          <form className="space-y-4">
            <LocationSelector />

            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                className="w-full p-2 border rounded-md"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Select Option</label>
              <select className="w-full p-2 border rounded-md">
                <option value="">Choose an option</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Message</label>
              <textarea
                className="w-full p-2 border rounded-md"
                // rows="3"
                placeholder="Your message"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
