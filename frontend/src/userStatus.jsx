import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export default function UserStatus() {
  const token = localStorage.getItem("token");
  const [places, setPlaces] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8080/user/status", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.success) {
          setPlaces(data.result);
        }

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const getColor = (status) => {
    if (status === "approved") return "bg-green-100 text-green-800 px-2 py-1 rounded";
    if (status === "pending") return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded";
    if (status === "rejected") return "bg-red-100 text-red-800 px-2 py-1 rounded";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
  <h1 className="text-3xl font-bold mb-8 text-gray-800">
    My Listings
  </h1>

  {places.length === 0 ? (
    <p className="text-gray-500">No places found</p>
  ) : (
    <div className="grid gap-6 sm:grid-cols-2">
      {places.map((p) => (
        <div
          key={p._id}
          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          onClick={() => navigate(`/place/${p._id}`)}
        >
          {/* IMAGE */}
          <img
            src={p.img}
            alt={p.name}
            className="w-full h-40 object-cover"
          />

          {/* CONTENT */}
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {p.name}
            </h2>

            {/* STATUS BADGE */}
            <span
              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                p.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : p.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {p.status.toUpperCase()}
            </span>

            {/* REJECTION */}
            {p.status === "rejected" && (
              <p className="text-sm text-red-500 mt-2">
                Reason: {p.rejectionReason}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>
  );
}