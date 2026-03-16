import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Comments.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Comments(){

const [comments,setComments] = useState([]);
const [comment,setComment] = useState("");
const [rating,setRating] = useState(0);
const [message,setMessage] = useState("");

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
