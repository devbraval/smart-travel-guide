import { useState, useEffect } from "react";
import NavBar from "./NavBar";
import Card from "./Card";
import Filter from "./Filter";

export default function Dashboard() {
  const [places, setPlaces] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const userPlace = places.filter((p)=>p.isUserAdded);
  const defaultPlace = places.filter((p)=>!p.isUserAdded);
  const fetchPlaces = async (sort = "") => {
    try {
      const token = localStorage.getItem("token");

      let url = "http://localhost:8080/dashboard";

      // ✅ only add query when needed
      if (sort) {
        url += `?sortBy=${sort}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // 🔥 Filter only approved listings for the user side
        const approvedPlaces = data.result.filter(
          (place) => place.status === "approved"
        );
        
        console.log("Total fetched listings:", data.result.length); // DEBUG
        console.log("Approved listings showed to user:", approvedPlaces.length); // DEBUG
        
        setPlaces(approvedPlaces);
      }
    } catch (err) {
      console.error("Error fetching places:", err);
    }
  };

  useEffect(() => {
    fetchPlaces(sortBy);
  }, [sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans animate-fade-in pb-10">
      <NavBar />
      
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto">
        {/* 🔥 FILTER */}
        <Filter onChange={setSortBy} />

        {/* Default Places */}
<h2 className="text-xl font-bold px-6 mt-6">Explore Places</h2>
<Card places={defaultPlace} setPlaces={setPlaces} />

{/* User Added Places */}
<h2 className="text-xl font-bold px-6 mt-10">User Added Places</h2>
<Card places={userPlace} setPlaces={setPlaces} />
      </main>
    </div>
  );
}