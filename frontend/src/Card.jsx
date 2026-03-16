import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
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

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  const [menuOpen,setMenuOpen] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {

    const fetchData = async () => {
      try {

        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        const response = await fetch("http://localhost:8080/dashboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          }
        });

        const data = await response.json();
        console.log("Backend Data:", data);

        if (!data.success) {
          setMessage(data.message || "Fetching Data Failed");
        } else {
          setPlaces(data.result);
        }

      } catch (err) {
        setMessage("Server Error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, []);
  const handleDelete = async(id)=>{
    const token = localStorage.getItem("token");
    try{
      const respose = await fetch(`http://localhost:8080/delete-place/${id}`,{
        method:"DELETE",
        headers:{
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      const data = await respose.json();
      if(data.success){
        setPlaces((prev)=>prev.filter(p=>p._id !== id));
        console.log("Deleted successfully");
      }

    }catch(err){
      console.log("Error deleting place");
    }
  }

  if (loading) return <h2 className="text-center mt-5">Loading...</h2>;
  if (message) return <h2 className="text-center mt-5">{message}</h2>;
  if (places.length === 0) return <h2 className="text-center mt-5">No place found</h2>;

  return (
    <>
      <div className="card-container">

        {places.map((place, index) => (
          <div
            className="card"
            style={{ width: "18rem" }}
            key={place._id}
            onClick={() => navigate(`/place/${place._id}`)}
          >
            {
              place.userId === userId &&(
                <div className="card-menu">
                  <FontAwesomeIcon icon={faEllipsisV} style={{color:"rgb(255,255,255)",}}className="menu-icon" onClick={(e)=>{
                    e.stopPropagation();
                    setMenuOpen(menuOpen === place._id ? null : place._id);
                  }}/>
                  
                  {
                    menuOpen===place._id &&(
                      <div className="dropdown-menu-custom">
                        <p onClick={(e)=>{
                          e.stopPropagation();
                          navigate(`/edit-place/${place._id}`);
                        }}>Edit</p>
                        <p onClick={(e)=>{
                          e.stopPropagation();
                          handleDelete(place._id);
                        }}>Delete</p>
                      </div>
                    )
                  }
                </div>
              )
            }
            <img src={place.img} alt={place.name} />

            <div className="card-body">

              <h5 className="card-title">
                <FontAwesomeIcon icon={getIconForCategory(place.category)} /> {place.name}
              </h5>

              <p className="card-text">
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
    </>
  );
}