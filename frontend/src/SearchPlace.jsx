import { useState, useEffect } from "react";
import "./SearchPlace.css";
import { useSearchParams } from "react-router-dom";

export default function SearchPlace() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [message,setMessage] = useState("");
  const [params] = useSearchParams();
  const district = params.get("district");

  useEffect(() => {
    if (!district) {
        setMessage("District is missing from the search query");
        setLoading(false);
        return;
    };

    const load = async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/search-district",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ district }),
          }
        );

        const json = await res.json();
        if(!res.ok){
            setMessage(json.message || "Something went wrong");
            setData(null);
            return;
        }
        setData(json);
      } catch (err) {
       console.error(err);
       setMessage("Network error. Please try again.");
       setData(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [district]);

  if (loading)
    return <h2 className="loading-text">Searching best places...</h2>;

  if (!data?.results)
    return <h2 className="no-results">No results found</h2>;

  return (
    <div className="search-container">
      <h1 className="search-title">{data.location}</h1>

      {Object.entries(data.results).map(([category, places]) => (
        <div key={category} className="category-section">
          <h2 className="category-title">{category}</h2>

          <div className="places-grid">
            {places.map((place) => (
              <div key={place.id} className="place-card">
                <div className="place-name">{place.name}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}