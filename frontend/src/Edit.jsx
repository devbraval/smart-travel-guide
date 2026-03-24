import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Edit.css";

export default function Edit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState(""); // ✅ FIXED
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState("");
  const [img, setImg] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const response = await fetch(`http://localhost:8080/edit-place/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          const place = data.result;
          setName(place.name);
          setDescription(place.description);
          setState(place.state);
          setDistrict(place.district);
          setCategory(place.category);
          setRating(place.rating);
          setImg(place.img);
          setLat(place.lat);
          setLng(place.lng);
        }
      } catch (err) {
        setMessage("Error loading place");
      }
    };

    fetchPlace();
  }, [id]);

  const onSubmitClick = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8080/edit-place/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name,
          description,
          state,
          district,
          category,
          rating,
          img,
          lat,
          lng,
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate("/dashboard");
      }
    } catch (err) {
      setMessage("Error submitting updated listing");
    }
  };

  return (
    <div className="form-wrapper">
      <form className="form-card" onSubmit={onSubmitClick}>

        <h2>Edit Place Details</h2>

        <label>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />

        <label>State</label>
        <input type="text" value={state} onChange={(e) => setState(e.target.value)} required />

        <label>District</label>
        <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} required />

        <label>Category</label>
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />

        <label>Rating</label>
        <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} required />

        <label>Image URL</label>
        <input type="url" value={img} onChange={(e) => setImg(e.target.value)} required />

        <label>Latitude</label>
        <input type="text" value={lat} onChange={(e) => setLat(e.target.value)} required />

        <label>Longitude</label>
        <input type="text" value={lng} onChange={(e) => setLng(e.target.value)} required />

        <div className="btn-group">
          <button type="submit" className="primary-btn">Update</button>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              setName("");
              setDescription("");
              setState("");
              setDistrict("");
              setCategory("");
              setRating("");
              setImg("");
              setLat("");
              setLng("");
            }}
          >
            Clear
          </button>
        </div>

        {message && <p className="message">{message}</p>}

      </form>
    </div>
  );
}