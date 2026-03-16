import { useState,useEffect } from "react";
import { useNavigate,useParams } from "react-router-dom";
export default function Edit(){
    const {id} = useParams();
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
    useEffect(()=>{
        const fetchPlace = async()=>{
            try{

        
            const response = await fetch(`http://localhost:8080/edit-place/${id}`,{
                method:"GET",
                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            if(data.success){
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
        }catch(err){
            setMessage("Error loading place");
        }
        }
        fetchPlace();
    },[id]);
    const onSubmitClick = async(e)=>{
        e.preventDefault();
        try{
            const response = await fetch(`http://localhost:8080/edit-place/${id}`,{
                method:"PUT",
                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${localStorage.getItem("token")}`,
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
                    lng,
                }),
            });
            const data = await response.json();
            if(data.success){
                navigate(`/dashboard`);
            }
        }catch(err){
            setMessage("Error In submiting the updated listing");
        }
    }
    return(
        <div className="add-form">
            <form className="mb-3" onSubmit={onSubmitClick}>

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
                    <button type="submit" className="btn btn-primary">Update</button>
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