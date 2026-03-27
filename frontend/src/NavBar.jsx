import logo from "./assets/newhdlogo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function NavBar() {
  const [district, setDistrict] = useState("");
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-16 sm:h-20 px-4 sm:px-8 md:px-12 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-4 sm:gap-6">
        <a href="/"><img src={logo} alt="Smart Travel" className="h-8 sm:h-10 w-auto object-contain cursor-pointer" /></a>
        <a href="/"><FontAwesomeIcon icon={faHouse} className="text-lg sm:text-xl text-gray-500 hover:text-primary transition-colors cursor-pointer" title="Home" /></a>
      </div>

      <div className="flex-1 flex justify-center px-2 sm:px-4">
        <form
          className="relative w-full max-w-lg flex items-center group"
          onSubmit={(e) => {
            e.preventDefault();
            if (!district.trim()) return;
            window.location.href = `/search?district=${district}`;
          }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            className="w-full py-2.5 sm:py-3 pl-11 pr-24 rounded-full border border-gray-200 bg-gray-50/50 text-sm md:text-base text-gray-800 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white shadow-inner transition-all duration-300 placeholder-gray-400"
            type="search"
            placeholder="Search for places..."
            onChange={(e) => setDistrict(e.target.value)}
          />
          <button className="absolute right-1.5 sm:right-2 py-1.5 sm:py-2 px-4 sm:px-5 bg-gray-900 hover:bg-gray-800 text-white text-xs md:text-sm font-semibold rounded-full transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
            Search
          </button>
        </form>
      </div>

      <div className="flex items-center gap-4 hidden md:flex">
        {/* Placeholder for future auth/profile items */}
      </div>
    </header>
  );
}
