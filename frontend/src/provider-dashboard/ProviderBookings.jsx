import { useState, useEffect } from 'react';

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("http://localhost:8080/provider/bookings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setBookings(data.result);
        }
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return <div className="text-gray-500 font-medium">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Bookings</h1>
        <p className="text-gray-500 mt-1">View and manage your upcoming and past bookings.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No bookings found.</td></tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6 text-sm font-medium text-blue-600">
                      {booking.bookingId ? booking.bookingId.substring(0,8).toUpperCase() : booking._id.substring(0,8)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {booking.customer?.name ? booking.customer.name.charAt(0) : 'G'}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{booking.customer?.name || "Guest"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{booking.listing?.name || "Deleted Service"}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{new Date(booking.date).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-800">₹{booking.amount}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
