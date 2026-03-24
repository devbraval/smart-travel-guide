import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  faGamepad,
  faCirclePlus,
  faEllipsisV
} from "@fortawesome/free-solid-svg-icons";
import "./Card.css";

const getIconForCategory = (category) => {
  const map = {
    "Restaurant": faUtensils,
    "Cafe": faCoffee,
    "Park": faTree,
    "Hotel": faHotel,
    "Mall": faShoppingBag,
    "Religious Place": faPrayingHands,
    "Beach": faWater,
    "Game Zone": faGamepad
  };

  return map[category] || faMapMarkerAlt;
};

export default function Card({ places, setPlaces }) {
  const [menuOpen, setMenuOpen] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:8080/delete-place/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setPlaces((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.log("Delete error");
    }
  };

  if (!places || places.length === 0) {
    return <h2 className="text-center mt-5">No place found</h2>;
  }

  return (
    <div className="card-container">
      {places.map((place) => (
        <div
          className="card"
          key={place._id}
          onClick={() => navigate(`/place/${place._id}`)}
        >
          {/* MENU */}
          {place.userId === userId && (
            <div className="card-menu">
              <FontAwesomeIcon
                icon={faEllipsisV}
                className="menu-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(menuOpen === place._id ? null : place._id);
                }}
              />

              {menuOpen === place._id && (
                <div className="dropdown-menu-custom">
                  <p onClick={() => navigate(`/edit-place/${place._id}`)}>
                    Edit
                  </p>
                  <p onClick={() => handleDelete(place._id)}>Delete</p>
                </div>
              )}
            </div>
          )}

          <img src={place.img} alt={place.name} />

          <div className="card-body">
            <h5>
              <FontAwesomeIcon icon={getIconForCategory(place.category)} />{" "}
              {place.name}
            </h5>

            <p>
              <FontAwesomeIcon icon={faMapMarkerAlt} /> {place.state}
            </p>

            <p className="rating">⭐ {place.rating}</p>
          </div>
        </div>
      ))}

      <FontAwesomeIcon
        icon={faCirclePlus}
        className="add-icon"
        onClick={() => navigate("/add-place")}
      />
    </div>
  );
}