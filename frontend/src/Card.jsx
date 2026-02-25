import { useEffect, useState, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Card.css";
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
  const [message,setMessage] = useState("");
  const[loading,setLoading] = useState(true);
  const[places,setPlaces]= useState([]);
  useEffect(()=>{

    const fetchData = async()=>{
      try{
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/dashboard",{
          method:"GET",
          headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${token}`,
          }
        });
        const data = await response.json();
        console.log("Backend Data:", data);
        if (!data.success) {
          setMessage(data.message || "Fetching Data Failed");
          return;
        }else{
          setPlaces(data.result);
        }
        }catch(err){
          setMessage("Server Error");
        }finally{
          setLoading(false);
        }
  };
  fetchData();
},[])
  if(loading) return <h2>loading....</h2>
  if(message) return <h2>{message}</h2>
  if(places.length === 0) return <h2>No place found</h2>
  return(
     <>
     {
      <div className="card-container">
        {
          places.map((place,index)=>(
            <div className="card" style={{ width: "18rem" }} key={index}>
              <img src={place.img} alt={place.name} 
/>
              <div className="card-body">
                <h5 className="card-title">{place.name}</h5>
                <p className="card-text">{place.state}</p>
                <p className="rating">⭐ {place.rating}</p>
              </div>
            </div>
          ))
        }
      </div>
     }
     </>
  )
}