import { useState, useEffect } from "react";
import NavBar from "./NavBar";
import Card from "./Card";
import Filter from "./Filter";

export default function Dashboard() {
  const [places, setPlaces] = useState([]);
  const [sortBy, setSortBy] = useState("");

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
        setPlaces(data.result);
      }
    } catch (err) {
      console.log("Error fetching places");
    }
  };

  useEffect(() => {
    fetchPlaces(sortBy);
  }, [sortBy]);

  return (
    <div>
      <NavBar />

      {/* 🔥 FILTER */}
      <Filter onChange={setSortBy} />

      {/* 🔥 CARDS */}
      <Card places={places} setPlaces={setPlaces} />
    </div>
  );
}