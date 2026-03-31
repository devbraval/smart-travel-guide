import { useState } from "react";

export default function ListingCard({ listing, refresh }) {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const token = localStorage.getItem("token");

  const approve = async () => {
    const res = await fetch(`http://localhost:8080/admin/listing/${listing._id}/approve`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if(!data.success){
      alert(data.message);
      return;
    }
    if(data.warning){
      alert("Warning: Similar places found:\n" + data.warning.map(p=>`- ${p.name} (${p.district}, ${p.state})`).join("\n"));
    }
    refresh();
  };

  const reject = async () => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    const res = await fetch(`http://localhost:8080/admin/listing/${listing._id}/reject`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    refresh();
  };

  const del = async () => {
    if (!window.confirm("Delete this listing?")) return;

    await fetch(`http://localhost:8080/admin/listing/${listing._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    refresh();
  };

  return (
    <>
      {/* CARD */}
      <div className="border p-4 rounded shadow mb-4 flex gap-4">

        <img
          src={listing.img}
          alt={listing.name}
          className="w-32 h-32 object-cover rounded"
        />

        <div className="flex-1">
          <h2 className="text-xl font-bold">{listing.name}</h2>
          <p>{listing.description}</p>

          <p className="text-sm text-gray-500">
            {listing.owner?.name} ({listing.owner?.email})
          </p>

          {listing.status === "rejected" && listing.rejectionReason && (
            <p className="text-sm text-red-500 mt-2">
              Rejection Reason: {listing.rejectionReason}
            </p>
          )}

          <p>Status: <b>{listing.status}</b></p>

          {/* 🔥 BUTTONS */}
          <div className="mt-3 flex gap-2">

            {/* ✅ VIEW BUTTON */}
            <button
              onClick={() => setSelectedPlace(listing)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              View
            </button>

            {listing.status === "pending" && (
              <>
                <button onClick={approve} className="bg-green-500 px-3 py-1 text-white rounded">✔</button>
                <button onClick={reject} className="bg-yellow-500 px-3 py-1 text-white rounded">✖</button>
              </>
            )}

            {listing.status === "approved" && (
              <button onClick={reject} className="bg-yellow-500 px-3 py-1 text-white rounded">
                Reject
              </button>
            )}

            {listing.status === "rejected" && (
              <button onClick={approve} className="bg-green-500 px-3 py-1 text-white rounded">
                Approve
              </button>
            )}

            <button onClick={del} className="bg-red-500 px-3 py-1 text-white rounded">
              🗑
            </button>

          </div>
        </div>
      </div>

      {/* 🔥 MODAL */}
      {selectedPlace && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedPlace(null)} // click outside to close
        >
          <div
            className="bg-white rounded-xl p-6 w-[500px] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // prevent close on inside click
          >

            <h2 className="text-xl font-bold mb-2">
              {selectedPlace.name}
            </h2>

            <img
              src={selectedPlace.img}
              className="w-full h-48 object-cover rounded mb-3"
            />

            <p><b>Description:</b> {selectedPlace.description}</p>
            <p><b>State:</b> {selectedPlace.state}</p>
            <p><b>District:</b> {selectedPlace.district}</p>
            <p><b>Category:</b> {selectedPlace.category}</p>
            <p><b>Rating:</b> {selectedPlace.rating}</p>
            <p><b>Lat:</b> {selectedPlace.lat}</p>
            <p><b>Lng:</b> {selectedPlace.lng}</p>

            <button
              className="mt-4 bg-gray-600 text-white px-3 py-1 rounded"
              onClick={() => setSelectedPlace(null)}
            >
              Close
            </button>

          </div>
        </div>
      )}
    </>
  );
}