import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export default function UserStatus() {
  const token = localStorage.getItem("token");
  const [places, setPlaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("listings");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resList = await fetch("http://localhost:8080/user/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataList = await resList.json();
        if (dataList.success) setPlaces(dataList.result);

        // Fetch User Bookings
        const resBookings = await fetch("http://localhost:8080/user/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataBookings = await resBookings.json();
        if (dataBookings.success) setBookings(dataBookings.result);

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
    <div className="p-6 max-w-5xl mx-auto animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          My Board
        </h1>
        <div className="flex bg-gray-100 p-1 flex-row rounded-lg font-medium">
          <button onClick={() => setTab('listings')} className={`px-4 py-2 rounded-md transition-colors ${tab === 'listings' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>My Listings</button>
          <button onClick={() => setTab('bookings')} className={`px-4 py-2 rounded-md transition-colors ${tab === 'bookings' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>My Bookings</button>
        </div>
      </div>

      {tab === "listings" ? (
        places.length === 0 ? (
          <p className="text-gray-500 p-8 text-center bg-gray-50 rounded-2xl border border-dashed">No places found</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {places.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/place/${p._id}`)}
              >
                <img
                  src={p.img || p.images?.cover}
                  alt={p.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    {p.name}
                  </h2>
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
                  {p.status === "rejected" && (
                    <p className="text-sm text-red-500 mt-2">
                      Reason: {p.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        bookings.length === 0 ? (
          <p className="text-gray-500 p-8 text-center bg-gray-50 rounded-2xl border border-dashed">No bookings found</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
             {bookings.map(b => (
                <div key={b._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => navigate(`/place/${b.listing?._id}`)}>
                   <img src={b.listing?.img || b.listing?.images?.cover} className="w-full h-40 object-cover" />
                   <div className="p-4 flex-1 flex flex-col">
                     <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{b.listing?.name}</h3>
                     <span className="text-xs text-gray-500 mb-3">{b.listing?.district || b.listing?.location?.city}, {b.listing?.state || b.listing?.location?.state}</span>
                     
                     <div className="mt-auto space-y-1 bg-blue-50/50 p-3 rounded-lg border border-blue-50 text-sm">
                       <p className="flex justify-between items-center text-gray-600"><span className="font-medium">Dates</span> <span className="font-semibold text-gray-900">{new Date(b.date).toLocaleDateString()} - {new Date(b.toDate).toLocaleDateString()}</span></p>
                       <p className="flex justify-between items-center text-gray-600"><span className="font-medium">Guests</span> <span className="font-semibold text-gray-900">{b.guests}</span></p>
                       <div className="pt-2 mt-2 border-t border-blue-100 flex justify-between items-center">
                         <span className="font-medium text-blue-700">Total Paid</span>
                         <span className="font-bold text-xl text-blue-700">₹{b.amount}</span>
                       </div>
                     </div>
                     <div className="mt-4 text-center">
                         <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-widest">{b.status}</span>
                     </div>
                   </div>
                </div>
             ))}
          </div>
        )
      )}
    </div>
  );
}