import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Card from "./Card";
import Filter from "./Filter";

export default function Dashboard() {
  const [places, setPlaces] = useState([]);
  const [sortBy, setSortBy] = useState("");

  // 🔥 Remove favorites from other sections so they don't duplicate
  const excludeFavorites = (list) =>
    list.filter((p) => !p.isFavorite);

  // 🎯 Categories
  const hotels = excludeFavorites(
    places.filter((p) => p.category?.toLowerCase() === "hotel")
  );

  const resorts = excludeFavorites(
    places.filter((p) => p.category?.toLowerCase() === "resort")
  );

  const tourPackages = excludeFavorites(
    places.filter((p) => p.category?.toLowerCase() === "tour package")
  );

  const cabServices = excludeFavorites(
    places.filter((p) => p.category?.toLowerCase() === "cab service")
  );

  const pgs = excludeFavorites(
    places.filter((p) => p.category?.toLowerCase() === "pg")
  );

  // Remaining
  const remainingPlaces = places.filter((p) => {
    const cat = p.category?.toLowerCase();
    return !["hotel", "resort", "tour package", "cab service", "pg"].includes(cat);
  });

  const remainingUserAdded = excludeFavorites(
    remainingPlaces.filter((p) => p.isUserAdded)
  );

  const remainingExplore = excludeFavorites(
    remainingPlaces.filter((p) => !p.isUserAdded)
  );
  const favoritePlaces = places.filter((p) => p.isFavorite);

  const navigate = useNavigate();

  const toggleFavorite = async (placeId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to add favorites");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/toggle-favorite/${placeId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setPlaces(prev =>
          prev.map(p =>
            String(p._id) === String(placeId)
              ? { ...p, isFavorite: !p.isFavorite }
              : p
          )
        );
      } else {
        console.error("Backend error:", data.message);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  // 📦 Fetch data
  const fetchPlaces = async (sort = "") => {
    try {
      const token = localStorage.getItem("token");

      let url = "http://localhost:8080/dashboard";
      if (sort) url += `?sortBy=${sort}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      // fetch favorites map
      let favSet = new Set();
      try {
        const favResponse = await fetch("http://localhost:8080/favorites", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const favData = await favResponse.json();
        if (favData.success) {
          favSet = new Set(favData.favorites.map(id => String(id)));
        }
      } catch (err) {
        console.error("Could not fetch favorites on load", err);
      }

      if (data.success) {
        const approvedPlaces = data.result.filter(
          (place) => place.status === "approved"
        ).map(place => ({
          ...place,
          isFavorite: favSet.has(String(place._id))
        }));

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

      <main className="flex-1 w-full max-w-[1600px] mx-auto">
        {/* 🔥 FILTER */}
        <Filter onChange={setSortBy} />

        {/* ❤️ FAVORITES FIRST */}
        {favoritePlaces.length > 0 && (
          <>
            <h2 className="text-xl font-bold px-6 mt-10 text-red-600">
              Your Favorites ♥
            </h2>
            <Card
              places={favoritePlaces}
              setPlaces={setPlaces}
              onToggleFavorite={toggleFavorite}
            />
          </>
        )}

        {resorts.length > 0 && (
          <>
            <h2 className="text-xl font-bold px-6 mt-10">Premium Resorts</h2>
            <Card
              places={resorts}
              setPlaces={setPlaces}
              onToggleFavorite={toggleFavorite}
            />
          </>
        )}

        {tourPackages.length > 0 && (
          <>
            <h2 className="text-xl font-bold px-6 mt-10">Tour Packages</h2>
            <Card
              places={tourPackages}
              setPlaces={setPlaces}
              onToggleFavorite={toggleFavorite}
            />
          </>
        )}

        {cabServices.length > 0 && (
          <>
            <h2 className="text-xl font-bold px-6 mt-10">Cab Services</h2>
            <Card
              places={cabServices}
              setPlaces={setPlaces}
              onToggleFavorite={toggleFavorite}
            />
          </>
        )}

        {pgs.length > 0 && (
          <>
            <h2 className="text-xl font-bold px-6 mt-10">PGs & Hostels</h2>
            <Card
              places={pgs}
              setPlaces={setPlaces}
              onToggleFavorite={toggleFavorite}
            />
          </>
        )}

        {remainingExplore.length > 0 && (
          <>
            <h2 className="text-xl font-bold px-6 mt-10">Explore Places</h2>
            <Card
              places={remainingExplore}
              setPlaces={setPlaces}
              onToggleFavorite={toggleFavorite}
            />
          </>
        )}

        {remainingUserAdded.length > 0 && (
          <>
            <h2 className="text-xl font-bold px-6 mt-10">
              Other User Added Places
            </h2>
            <Card
              places={remainingUserAdded}
              setPlaces={setPlaces}
              onToggleFavorite={toggleFavorite}
            />
          </>
        )}

        {hotels.length > 0 && (
          <>
            <h2 className="text-xl font-bold px-6 mt-10">Stunning Hotels</h2>
            <Card
              places={hotels}
              setPlaces={setPlaces}
              onToggleFavorite={toggleFavorite}
            />
          </>
        )}
      </main>
    </div>
  );
}