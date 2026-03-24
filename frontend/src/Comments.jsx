import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Comments.css";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV
} from "@fortawesome/free-solid-svg-icons";
export default function Comments(){

const [comments,setComments] = useState([]);
const [comment,setComment] = useState("");
const [rating,setRating] = useState(0);
const [message,setMessage] = useState("");
const userId = localStorage.getItem("userId");
const [openMenu,setOpenMenu] = useState(null);
const navigate = useNavigate();
const token = localStorage.getItem("token");
const { id } = useParams();

const fetchComments = async () => {
    try{

        const response = await fetch(`http://localhost:8080/get-comments/${id}`);
        const data = await response.json();

        if(data.success){
            setComments(data.result);
        }

    }catch(err){
        console.log(err);
    }
};

useEffect(()=>{ 
    fetchComments();
},[id]);

const handleSubmit = async()=>{

    if(!comment || !rating){
        return setMessage("All Fields Required");
    }

   try{
        const response = await fetch(`http://localhost:8080/add-comments/${id}`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                Authorization:`Bearer ${token}`,
            },
            body:JSON.stringify({
                comment,
                rating
            })
        });

        const data = await response.json();

        if(!data.success){
            return setMessage(data.message);
        }

        setRating(0);
        setComment("");
        setMessage("Comment added successfully");

        fetchComments();

   }catch(err){
        setMessage("Server error");
   }

}
const handleDelete = async(id)=>{
  const token = localStorage.getItem("token");
  try{
    const response = await fetch(`http://localhost:8080/delete-comment/${id}`,{
      method:"DELETE",
      headers:{
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    if(data.success){
      setComments((prev)=>prev.filter((p)=>p._id !== id));
      setMessage("Deleted Successfully");
    }
  }catch(err){
    setMessage("Error in Deleting the comment");
  }
}

return(
<>
<br/>

<div className="form-floating">

<textarea
className="form-control"
placeholder="Leave a comment here"
style={{height:"100px"}}
value={comment}
onChange={(e)=>setComment(e.target.value)}
></textarea>

<label>Comments</label>

<div style={{fontSize:"30px",cursor:"pointer"}}>

{[1,2,3,4,5].map((star)=>(
<span
key={star}
onClick={()=>setRating(star)}
style={{color:star<=rating?"gold":"gray"}}
>
★
</span>
))}

</div>

<button
type="button"
className="btn btn-outline-secondary mt-2"
onClick={handleSubmit}
>
Comment
</button>

<hr/>

<div className="container">
  <div className="row">

    {comments.map((c,index)=>(
      <div className="col-lg-4 col-md-6 mb-3" key={index}>
        <div className="card h-100">
          <div className="card-body">
          {
  c.userId.toString() === userId && (
    <>
      <div className="commet-menu">
        <FontAwesomeIcon
          icon={faEllipsisV}
          style={{ color: "black" }}
          className="menu-icon"
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenu(openMenu === c._id ? null : c._id);
          }}
        />
      </div>

      {openMenu === c._id && (
        <div className="dropdown-menu-custom">
          <p
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/edit-comment/${c._id}`);
            }}
          >
            Edit
          </p>

          <p
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(c._id);
            }}
          >
            Delete
          </p>
        </div>
      )}
    </>
  )
}
            <h6>{c.userName}</h6>

            <p>{c.comment}</p>

            <div style={{color:"gold"}}>
              {"★".repeat(c.rating)}
              {"☆".repeat(5-c.rating)}
            </div>

          </div>
        </div>
      </div>
    ))}

  </div>
</div>
</div>
</>
);
}
