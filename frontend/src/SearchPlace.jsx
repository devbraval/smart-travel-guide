import { useState, useEffect } from "react";
import "./SearchPlace.css";
import { useSearchParams,useNavigate } from "react-router-dom";
import Card from "./Card";


export default function SearchPlace() {
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  const [message, setMessage] = useState("");

  const [params] = useSearchParams();
  const token = localStorage.getItem("token");
  const query = params.get("q")?.trim(); // 🔥 changed from district → q

useEffect(() => {
  if (query === null) return; // 🔥 important fix

  if (!query) {
    setMessage("Search query is missing");
    setLoading(false);
    return;
  }

  console.log("QUERY:", query);

  const load = async () => {
    try {
      const res = await fetch(
  `http://localhost:8080/search?q=${query}`,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Something went wrong");
        setPlaces([]);
        return;
      }

      setPlaces(data.result);

    } catch (err) {
      console.error(err);
      setMessage("Network error. Please try again.");
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  load();
}, [query]);

  // 🔄 LOADING
  if (loading)
    return <h2 className="loading-text">Searching places...</h2>;

  // ❌ ERROR / EMPTY
  if (message)
    return <h2 className="no-results">{message}</h2>;

  if (places.length === 0)
    return <h2 className="no-results">No places found</h2>;

  // ✅ RESULT UI
// ✅ RESULT UI
return (
  <div className="search-container">
    <h1 className="search-title">Results for "{query}"</h1>

    <Card places={places} setPlaces={setPlaces} />
  </div>
);
}