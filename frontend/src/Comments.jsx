import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV, faStar } from "@fortawesome/free-solid-svg-icons";

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const userId = localStorage.getItem("userId");
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { id } = useParams();

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:8080/get-comments/${id}`);
      const data = await response.json();
      if (data.success) {
        setComments(data.result);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  const handleSubmit = async () => {
    if (!comment || !rating) {
      return setMessage("All Fields Required");
    }
    try {
      const response = await fetch(`http://localhost:8080/add-comments/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment, rating }),
      });
      const data = await response.json();
      if (!data.success) {
        return setMessage(data.message);
      }
      setRating(0);
      setComment("");
      setMessage("Comment added successfully");
      fetchComments();
    } catch (err) {
      setMessage("Server error");
    }
  };

  const handleDelete = async (commentId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8080/delete-comment/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        setComments((prev) => prev.filter((p) => p._id !== commentId));
        setMessage("Deleted Successfully");
      }
    } catch (err) {
      setMessage("Error in Deleting the comment");
    }
  };

  return (
    <div className="w-full">
      {message && (
        <div className="mb-4 p-3 rounded-xl bg-blue-50 text-blue-600 text-sm font-medium">
          {message}
        </div>
      )}

      {/* Input Section */}
      <div className="mb-10 bg-gray-50/50 p-6 md:p-8 rounded-2xl border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Leave a Review</h3>
        
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform hover:scale-110"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <FontAwesomeIcon 
                icon={faStar} 
                className={`text-2xl transition-colors duration-200 ${(hoverRating || rating) >= star ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-300'}`} 
              />
            </button>
          ))}
          <span className="ml-3 text-sm font-medium text-gray-500">
            {rating > 0 ? `${rating} out of 5` : "Select a rating"}
          </span>
        </div>

        <textarea
          className="w-full p-4 border border-gray-200 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 resize-none shadow-sm"
          placeholder="Share your experience here..."
          rows="4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            onClick={handleSubmit}
          >
            Post Review
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comments.map((c, index) => (
          <div 
            key={index} 
            className="group relative bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
          >
            {c.userId?.toString() === userId && (
              <div className="absolute top-4 right-4 z-10">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenu(openMenu === c._id ? null : c._id);
                  }}
                >
                  <FontAwesomeIcon icon={faEllipsisV} className="text-sm" />
                </button>
                {openMenu === c._id && (
                  <div className="absolute right-0 top-10 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 overflow-hidden animate-fade-in z-20">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-comment/${c._id}`);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c._id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-blue-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {c.userName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h6 className="font-bold text-gray-900 text-sm">{c.userName || "User"}</h6>
                <div className="flex items-center gap-1 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon 
                      key={i} 
                      icon={faStar} 
                      className={`text-xs ${i < c.rating ? 'text-yellow-400' : 'text-gray-200'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mt-2 flex-grow overflow-hidden">
              {c.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
