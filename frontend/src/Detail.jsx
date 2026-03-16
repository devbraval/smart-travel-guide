  import { useEffect, useState } from "react"
  import {useParams} from "react-router-dom";
  import {MapContainer,TileLayer,Marker,Popup} from 'react-leaflet';
  import "./Detail.css"
  import Comments from "./Comments";
  export default function Detail(){
  const {id} = useParams();
  const [place,setPlace] = useState(null);
  const [loading,setLoading] = useState(true);
  const [message,setMessage] = useState("");
  useEffect(()=>{
      const fetchPlace = async()=>{
          try{
              const token = localStorage.getItem("token");
              const response = await fetch(`http://localhost:8080/place/${id}`,{
                  method:"GET",
                  headers:{
                      "Content-Type":"application/json",
                      "Authorization":`Bearer ${token}`,
                  }
              });
              const data = await response.json();
              if(!data.success){
              setMessage(data.message || "Something went wrong");
              }else{
              setPlace(data.result);
          }
          }catch(err){
            setMessage("Server Error");
          }finally{
            setLoading(false);
          }
      }
  fetchPlace();
  },[id])
  if (loading) return <h2>Loading...</h2>;
  if (message) return <h2>{message}</h2>;
  if (!place) return <h2>No data found</h2>;
     return (
  <div className="detail-page">

    {/* HERO IMAGE */}
    <div className="detail-hero">
      <img src={place.img} alt={place.name} />
    </div>

    {/* CONTENT */}
    <div className="detail-container">

      <h1 className="place-title">{place.name}</h1>

      <div className="place-meta">
        <span className="location">
          📍 {place.district}, {place.state}
        </span>

        <span className="rating">
          ⭐ {place.rating || "4.5"}
        </span>
      </div>

      <div className="description-section">
        <h2>About this place</h2>
        <p>{place.description}</p>
      </div>
      <div style={{marginTop:"20px"}}>

        <iframe
          width="100%"
          height="400"
          style={{border:0}}
          loading="lazy"
          allowFullScreen
          src={`https://www.google.com/maps?q=${place.lat},${place.lng}&z=14&output=embed`} >
        </iframe>
        <Comments/>
</div>

    </div>

  </div>
);
  }