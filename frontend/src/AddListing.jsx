import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddListing.css";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AddListing(){
    const navigate = useNavigate();
    const [name,setName] = useState("");
    const [description,setDescription] = useState("");
    const [state,setState] = useState("");
    const [district,setDistrict] = useState("");
    const [category,setCategory] = useState("");
    const [rating,setRating] = useState("");
    const [img,setImg] = useState("");
    const [lat,setLat] = useState("");
    const [lng,setLng] = useState("");
    const [message,setMessage] = useState("");
    const onSubmit = async(e)=>{
        e.preventDefault();
        try{
            const response = await fetch("http://localhost:8080/add-place",{
                method:"POST",
                headers:{
                    Authorization:`Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                body:JSON.stringify({
                    name,
                    description,
                    state,
                    district,
                    category,
                    rating,
                    img,
                    lat,
                    lng
                }),
            },
            );
            const data = await response.json();
            if(data.success){
                setMessage("Place Added Successfully ");
                setTimeout(()=>{
                    navigate("/dashboard");
                },1000);
                setName("");
                setDistrict("");
                setDescription("");
                setCategory("");
                setImg("");
                setLat("");
                setState("");
                setRating("");
                setLng("");
            }
        }catch(err){
            setMessage("Server error");
        }
    }
    

    return(
        <div className="add-form">
            <form className="mb-3" onSubmit={onSubmit}>

                <h2>Enter the details to add new Place</h2>

                <label className="form-label">Name</label>
                <input type="text" className="form-control" required onChange={(e)=>setName(e.target.value)} value={name}/>

                <label className="form-label">Description</label>
                <input type="text" className="form-control" required onChange={(e)=>setDescription(e.target.value)} value={description}/>

                <label className="form-label">State</label>
                <input type="text" className="form-control" required onChange={(e)=>setState(e.target.value)} value={state}/>

                <label className="form-label">District</label>
                <input type="text" className="form-control" required onChange={(e)=>setDistrict(e.target.value)} value={district}/>

                <label className="form-label">Category</label>
                <input type="text" className="form-control" required onChange={(e)=>setCategory(e.target.value)} value={category}/>

                <label className="form-label">Rating</label>
                <input type="number" className="form-control" required onChange={(e)=>setRating(e.target.value)} value={rating}/>

                <label className="form-label">Img Url</label>
                <input type="url" className="form-control" required onChange={(e)=>setImg(e.target.value)} value={img}/>

                <label className="form-label">Latitude</label>
                <input type="text" className="form-control" required onChange={(e)=>setLat(e.target.value)} value={lat}/>

                <label className="form-label">Longitude</label>
                <input type="text" className="form-control" required onChange={(e)=>setLng(e.target.value)} value={lng}/>

                <div className="button-group">
                    <button type="submit" className="btn btn-primary">Add</button>
                    <button type="reset" className="btn btn-secondary" onClick={
                        ()=>{
                            setName("");
                            setDistrict("");
                            setDescription("");
                            setCategory("");
                            setImg("");
                            setLat("");
                            setState("");
                            setRating("");
                            setLng("");
                        }
                    }>Clear</button>
                    {message && <p className="mt-3 text-success">{message}</p>}
                </div>

            </form>
        </div>
    )
}