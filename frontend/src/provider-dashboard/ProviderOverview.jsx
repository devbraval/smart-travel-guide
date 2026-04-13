import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen, faCheckDouble, faDollarSign, faStar } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

export default function ProviderOverview() {
  const [data, setData] = useState({
    stats: { servicesCount: 0, bookingsCount: 0, earnings: 0, rating: 0 },
    recentBookings: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch("http://localhost:8080/provider/dashboard-stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setData(result);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  const statsVisuals = [
    { label: 'Total Services', value: data.stats.servicesCount, icon: faBoxOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Bookings', value: data.stats.bookingsCount, icon: faCheckDouble, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Earnings', value: `₹${data.stats.earnings.toLocaleString()}`, icon: faDollarSign, color: 'text-yellow-500', bg: 'bg-yellow-50' },

  ];

  if (loading) {
    return <div className="text-gray-500 font-medium">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome back, Provider!</h1>
        <p className="text-gray-500 mt-1">Here is what's happening with your services today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsVisuals.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <FontAwesomeIcon icon={stat.icon} className="text-2xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Bookings</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold">View All</button>
        </div>
        <div className="space-y-4">
          {data.recentBookings.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent bookings found.</p>
          ) : (
            data.recentBookings.map((booking) => (
              <div key={booking._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-gray-50 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {booking.customer?.name ? booking.customer.name.charAt(0) : 'G'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{booking.customer?.name || "Guest"}</h4>
                    <p className="text-sm text-gray-500">Guests: {booking.guests}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 sm:justify-end">
                  <span className="text-sm text-gray-600 font-medium tracking-wide">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
