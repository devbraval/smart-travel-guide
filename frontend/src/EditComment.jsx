import { useState,useEffect } from "react";
import { useNavigate,useParams } from "react-router-dom";
import "./EditComment.css"
export default function Edit(){
    const {id} = useParams();
    const [comment,setComment] = useState("");
    const [rating,setRating] = useState(0);
    const [message,setMessage] = useState("");
    const navigate = useNavigate();
    const onUpdate = async(e)=>{
      e.preventDefault();
      try{
        const response = await fetch(`http://localhost:8080/edit-comment/${id}`,{
          method:"PUT",
          headers:{
            "Content-Type":"application/json",
            Authorization:`Bearer ${localStorage.getItem("token")}`,
          },
          body:JSON.stringify({
            comment,
            rating,
          }),

        });
        const data = await response.json();
        if(data.success){
          navigate(`/place/${data.data.placeId}`);
        }

      }catch(err){
        setMessage("Error In submiting the updated comment");
      }
    }
    return(
        <div className="add-form">
  <form className="edit-form">

    <h2>Edit your comment</h2>

    <label className="form-label">Comment</label>
    <textarea
      className="form-control"
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      required
    ></textarea>

    <label className="form-label mt-3">Rating</label>
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setRating(star)}
          className={star <= rating ? "star active" : "star"}
        >
          ★
        </span>
      ))}
    </div>

    <div className="button-group" onClick={onUpdate}>
      <button type="submit" className="btn btn-primary">
        Update
      </button>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => {
          setComment("");
          setRating(0);
        }}
      >
        Clear
      </button>
    </div>

    {message && <p className="message">{message}</p>}
  </form>
</div>
    )
    
}