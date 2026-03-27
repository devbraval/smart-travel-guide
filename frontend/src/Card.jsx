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
  faEllipsisV,
  faStar,
  faHeart
} from "@fortawesome/free-solid-svg-icons";

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
    return <div className="flex justify-center items-center py-20"><h2 className="text-2xl font-semibold text-gray-500">No place found</h2></div>;
  }

  return (
    <div className="px-4 sm:px-8 md:px-12 pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {places.map((place) => (
          <div
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 ease-out hover:-translate-y-1.5 cursor-pointer flex flex-col border border-gray-100"
            key={place._id}
            onClick={() => navigate(`/place/${place._id}`)}
          >
            
            {/* Image Section */}
            <div className="relative h-64 w-full overflow-hidden">
              <img src={place.img} alt={place.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              
              {/* Overlay Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-60 z-10" />
              
              {/* Top Icons */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <button className="p-2 w-9 h-9 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500 transition-all duration-200" onClick={(e) => { e.stopPropagation(); /* Add to favorites logic */ }}>
                  <FontAwesomeIcon icon={faHeart} className="text-sm" />
                </button>
              </div>

              {/* Edit/Delete Menu */}
              {place.userId === userId && (
                <div className="absolute top-4 left-4 z-30">
                  <button 
                    className="p-2 w-9 h-9 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-md text-gray-800 hover:bg-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === place._id ? null : place._id);
                    }}
                  >
                    <FontAwesomeIcon icon={faEllipsisV} className="text-sm" />
                  </button>
                  {menuOpen === place._id && (
                    <div className="absolute top-10 left-0 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-2 overflow-hidden animate-fade-in z-50">
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-place/${place._id}`);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(place._id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Hover "View Details" */}
              <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="px-5 py-2.5 bg-white/95 backdrop-blur-sm text-gray-900 text-sm font-semibold rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2)] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  View Details
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1 bg-white relative z-10">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h5 className="text-lg font-bold text-gray-900 line-clamp-1 flex items-center gap-2">
                  <FontAwesomeIcon icon={getIconForCategory(place.category)} className="text-primary/80 text-base" />
                  {place.name}
                </h5>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                  <span className="text-xs font-bold text-yellow-700">{place.rating}</span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-auto pt-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                {place.state}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button 
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 z-50 group"
        onClick={() => navigate("/add-place")}
        title="Add Place"
      >
        <FontAwesomeIcon icon={faCirclePlus} className="text-2xl group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
}