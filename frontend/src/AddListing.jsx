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
    const [images, setImages] = useState({ cover: "", gallery1: "", gallery2: "", gallery3: "", gallery4: "" });
    const [lat,setLat] = useState("");
    const [lng,setLng] = useState("");
    const [message,setMessage] = useState("");

    const onSubmit = async(e)=>{
        e.preventDefault();
        try{
            const formattedImages = {
                cover: images.cover,
                gallery: [images.gallery1, images.gallery2, images.gallery3, images.gallery4].filter(Boolean)
            };

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
                    img: images.cover,
                    images: formattedImages,
                    lat,
                    lng
                }),
            });
            const data = await response.json();
            if(!data.success){
                return setMessage(data.message);
            }
            if(data.success){
                setMessage("Place Added Successfully ");
                setTimeout(()=>{
                    navigate("/dashboard");
                },1000);
                setName("");
                setDistrict("");
                setDescription("");
                setCategory("");
                setImages({ cover: "", gallery1: "", gallery2: "", gallery3: "", gallery4: "" });
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
                <input type="number" className="form-control" required max="5" min="0" step="0.1" onChange={(e)=>setRating(e.target.value)} value={rating}/>

                <div className="mb-4 p-4 border rounded bg-light mt-3">
                  <label className="form-label fw-bold">Images (Grid Layout)</label>
                  <p className="text-muted small mb-3">Provide a cover image and up to 4 optional gallery images. Providing only the Cover Image falls back to the classic single banner style. Providing more enables the 5-Image Grid feature.</p>
                  
                  <div className="mb-3">
                    <label className="form-label text-primary">Cover Image URL (Required)</label>
                    <input type="url" className="form-control" onChange={(e) => setImages(prev => ({...prev, cover: e.target.value}))} value={images.cover} required />
                  </div>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label text-secondary small">Gallery Image 1</label>
                      <input type="url" className="form-control" onChange={(e) => setImages(prev => ({...prev, gallery1: e.target.value}))} value={images.gallery1} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary small">Gallery Image 2</label>
                      <input type="url" className="form-control" onChange={(e) => setImages(prev => ({...prev, gallery2: e.target.value}))} value={images.gallery2} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary small">Gallery Image 3</label>
                      <input type="url" className="form-control" onChange={(e) => setImages(prev => ({...prev, gallery3: e.target.value}))} value={images.gallery3} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary small">Gallery Image 4</label>
                      <input type="url" className="form-control" onChange={(e) => setImages(prev => ({...prev, gallery4: e.target.value}))} value={images.gallery4} />
                    </div>
                  </div>
                </div>

                <label className="form-label">Latitude</label>
                <input type="text" className="form-control" required onChange={(e)=>setLat(e.target.value)} value={lat}/>

                <label className="form-label">Longitude</label>
                <input type="text" className="form-control" required onChange={(e)=>setLng(e.target.value)} value={lng}/>

                <div className="button-group mt-4">
                    <button type="submit" className="btn btn-primary">Add Place</button>
                    <button type="reset" className="btn btn-secondary" onClick={
                        ()=>{
                            setName("");
                            setDistrict("");
                            setDescription("");
                            setCategory("");
                            setImages({ cover: "", gallery1: "", gallery2: "", gallery3: "", gallery4: "" });
                            setLat("");
                            setState("");
                            setRating("");
                            setLng("");
                        }
                    }>Clear Form</button>
                    {message && <p className="mt-3 text-success font-weight-bold">{message}</p>}
                </div>

            </form>
        </div>
    )
}