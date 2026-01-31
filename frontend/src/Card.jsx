import { useEffect, useState } from "react";
import "./Card.css";

export default function Card() {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const response = await fetch(
        "http://localhost:8080/api/nearby-places",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng }),
        }
      );

      const data = await response.json();

      setCategories(data.categories || {});
      setLoading(false);
    });
  }, []);

  if (loading) return <h2>Finding best places near you…</h2>;

  if (!categories || Object.keys(categories).length === 0) {
    return <h2>No places found nearby</h2>;
  }

  return (
    <>
      <h1>Best Places Near You</h1>

      {Object.entries(categories).map(([category, places]) => (
        <div key={category}>
          <h2 className="category-title">{category}</h2>

          <div className="category-section">
            {places.map((place, index) => (
              <div key={index} className="card">
                <h3 className="card-title">{place.name}</h3>
                <span className="card-description">
                  Popular nearby place
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
