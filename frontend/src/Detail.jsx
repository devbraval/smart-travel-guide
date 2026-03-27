import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Comments from "./Comments";
import NavBar from "./NavBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faStar, faHeart } from "@fortawesome/free-solid-svg-icons";

export default function Detail() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/place/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!data.success) {
          setMessage(data.message || "Something went wrong");
        } else {
          setPlace(data.result);
        }
      } catch (err) {
        setMessage("Server Error");
      } finally {
        setLoading(false);
      }
    };
    fetchPlace();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-20 items-center animate-fade-in">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (message) return <div className="min-h-screen bg-gray-50 pt-20 text-center"><h2 className="text-xl text-red-500 font-semibold">{message}</h2></div>;
  if (!place) return <div className="min-h-screen bg-gray-50 pt-20 text-center"><h2 className="text-xl text-gray-500 font-semibold">No data found</h2></div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-16 animate-fade-in flex flex-col">
      <NavBar />
      
      {/* HERO IMAGE */}
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden group">
        <img 
          src={place.img} 
          alt={place.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 z-10"></div>
        
        {/* Floating Favorite Button */}
        <button className="absolute top-6 right-6 md:top-8 md:right-10 z-20 p-3 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500 hover:scale-110 transition-all duration-300 shadow-lg">
          <FontAwesomeIcon icon={faHeart} className="text-lg" />
        </button>

        {/* Content on Image */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20 flex flex-col text-white max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-lg mb-3">
                {place.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-200 text-sm md:text-base font-medium">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-300" />
                <span>{place.district}, {place.state}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
              <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-lg" />
              <span className="text-base font-bold text-white">{place.rating || "4.5"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT CARDS */}
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-30 space-y-8 flex-1">
        
        {/* ABOUT SECTION */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10 transition-shadow hover:shadow-md duration-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            About this place
            <span className="ml-4 h-px flex-1 bg-gray-100"></span>
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-4xl text-base md:text-lg">
            {place.description}
          </p>
        </div>

        {/* MAP SECTION */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10 transition-shadow hover:shadow-md duration-300">
           <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            Location
            <span className="ml-4 h-px flex-1 bg-gray-100"></span>
          </h2>
          <div className="rounded-2xl overflow-hidden shadow-inner border border-gray-100">
            <iframe
              width="100%"
              height="400"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps?q=${place.lat},${place.lng}&z=14&output=embed`}
            ></iframe>
          </div>
        </div>

        {/* COMMENTS SECTION */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            Reviews
            <span className="ml-4 h-px flex-1 bg-gray-100"></span>
          </h2>
          <Comments />
        </div>

      </div>
    </div>
  );
}