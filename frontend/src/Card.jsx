import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faTree,
  faCoffee,
  faHotel,
  faMapMarkerAlt,
  faShoppingBag,
  faWater,
  faPrayingHands,
  faGamepad
} from "@fortawesome/free-solid-svg-icons";
import "./Card.css";

const getIconForCategory = (category) => {
  const map = {
    "Restaurant": faUtensils,
    "Fast Food": faUtensils,
    "Food Court": faUtensils,
    "Cafe": faCoffee,
    "Park": faTree,
    "Garden": faTree,
    "Hotel": faHotel,
    "Mall": faShoppingBag,
    "Super Market": faShoppingBag,
    "Religious Place": faPrayingHands,
    "Water": faWater,
    "Beach": faWater,
    "Game Zone": faGamepad
  };
  return map[category] || faMapMarkerAlt;
};



export default function Card() {
  const [categories, setCategories] = useState({});
  const [sourceInfo, setSourceInfo] = useState({ source: null, city: null });
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      try {
        const response = await fetch(
          "http://localhost:8080/api/nearby-places",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lng }),
          }
        );

        const data = await response.json();

        if (data.source) {
          setSourceInfo({ source: data.source, city: data.city });
        }
        setCategories(data.categories || {});
      } catch (error) {
        console.error("Failed to fetch places:", error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Geolocation error:", error);
      setLoading(false);
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  }, []);

  if (loading) return <div className="loading-container">Finding best places...</div>;

  return (
    <div className="places-container">
      <h1 className="page-title">Best Places Near You</h1>

      {sourceInfo.source === 'city' && (
        <div className="location-notice">
          <p>Could not find many places immediately around you.</p>
          <p>Showing results for <strong>{sourceInfo.city || "your city"}</strong>.</p>
        </div>
      )}

      {(!categories || Object.keys(categories).length === 0) ? (
        <div className="no-results">No places found nearby.</div>
      ) : (
        Object.entries(categories).map(([category, places]) => (
          <div key={category} className="category-section">
            <div className="category-header">
              <FontAwesomeIcon icon={getIconForCategory(category)} className="category-icon" />
              <h2 className="category-title">{category}</h2>
            </div>

            <div className="places-grid">
              {places.map((place, index) => (
                <div key={index} className="place-card">
                  <div className="card-content">
                    <h3 className="place-name">{place.name}</h3>
                    <span className="place-tag">{category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )))}
    </div>
  );
}