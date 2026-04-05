import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";  // ✅ ADD THIS
import Sidebar from "./Sidebar";
import ListingCard from "./ListingCard";
import ProviderCard from "./ProviderCard";
import PlaceCard from "./PlaceCard";
import Card from "./Card";
import NavBar from "./NavBar";
export default function AdminPanel() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("pending");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [dashboardPlace, setDashboardPlace] = useState([]);
  const [dashboardDataLoading, setDashboardDataLoading] = useState(false);
  const token = localStorage.getItem("token");
  
  const hotels = dashboardPlace.filter((p) => p.category?.toLowerCase() === "hotel");
  const resorts = dashboardPlace.filter((p) => p.category?.toLowerCase() === "resort");
  const tourPackages = dashboardPlace.filter((p) => p.category?.toLowerCase() === "tour package");
  const cabServices = dashboardPlace.filter((p) => p.category?.toLowerCase() === "cab service");
  const pgs = dashboardPlace.filter((p) => p.category?.toLowerCase() === "pg");

  const remainingPlaces = dashboardPlace.filter((p) => {
    const cat = p.category?.toLowerCase();
    return !["hotel", "resort", "tour package", "cab service", "pg"].includes(cat);
  });

  const remainingUserAdded = remainingPlaces.filter((p) => p.isUserAdded);
  const remainingExplore = remainingPlaces.filter((p) => !p.isUserAdded);

  const [providers, setProviders] = useState([]);
  const [places, setPlaces] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const id = user ? user._id : null;

  // ✅ Protect route
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);
  const fetchListings = async () => {
    try {
      setLoading(true);

      console.log("Fetching listings..."); // DEBUG

      const res = await fetch("http://localhost:8080/admin/listings/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Response status:", res.status); // DEBUG

      const data = await res.json();
      console.log(data); // DEBUG

      if (data.success) {
        setListings(data.result);
      }

    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchListings();
    }
  }, []); // 🔥 ONLY ONCE
  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:8080/admin/users/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.result);
      }
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  }
  useEffect(() => {
    if (tab === "users") {
      fetchUser();
    }
  }, [tab]);
  const fetchDashboardData = async () => {
    try {
      setDashboardDataLoading(true);
      const res = await fetch("http://localhost:8080/admin/user/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const approved = data.result.filter((place) => place.status === "approved");
        console.log("Filtered:", approved);
        setDashboardPlace(approved);
      }
    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setDashboardDataLoading(false);
    }
  }
  const fetchProvidersBytab = async () => {
    let url = "";
    if (tab === "pending-service-providers") {
      url = "http://localhost:8080/admin/provider/status/pending";
    } else if (tab === "approved-service-providers") {
      url = "http://localhost:8080/admin/providers/approved";
    } else if (tab === "rejected-service-providers") {
      url = "http://localhost:8080/admin/providers/rejected";
    }
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProviders(data.result || []);
      } else {
        setProviders([]);
      }
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  }
  useEffect(() => {
    if (
      tab === "pending-service-providers" ||
      tab === "approved-service-providers" ||
      tab === "rejected-service-providers"
    ) {
      fetchProvidersBytab();
    }

  }, [tab]);
  const fetchPlacesBytab = async () => {
    let url = "";
    if (tab === "pending-provider's-services") {
      url = "http://localhost:8080/admin/places/pending";
    } else if (tab === "approved-provider's-services") {
      url = "http://localhost:8080/admin/places/approved";
    } else if (tab === "rejected-provider's-services") {
      url = "http://localhost:8080/admin/places/rejected";
    }

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPlaces(data.result || []);
      } else {
        setPlaces([]);
      }
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  }
  useEffect(() => {
    if (
      tab === "pending-provider's-services" ||
      tab === "approved-provider's-services" ||
      tab === "rejected-provider's-services"
    ) {
      fetchPlacesBytab();
    }
  }, [tab]);


  useEffect(() => {
    if (tab === "dashboard") {
      fetchDashboardData();
    }
  }, [tab]);
  const filteredListings = listings.filter((l) => l.status === tab && l.owner);

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col lg:flex-row">
      <Sidebar tab={tab} setTab={setTab} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar */}
        <div className="bg-white border-b border-gray-100 z-20 shrink-0">
          <NavBar />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 w-full mx-auto pb-24">
          
          <div className="mb-8 border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight capitalize">
              {tab.replace(/-/g, " ")}
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Manage and review your platform data efficiently.</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
          {tab === "pending-provider's-services" || tab === "approved-provider's-services" || tab === "rejected-provider's-services" ? (
            places.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center"><p className="text-gray-500 text-lg font-medium">No places found</p></div>
            ) : (
              places.map((place) => (
                <PlaceCard key={place._id} place={place} refresh={() => fetchPlacesBytab()} />
              ))
            )
          ) : tab === "pending-service-providers" || tab === "approved-service-providers" || tab === "rejected-service-providers" ? (
            providers.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center"><p className="text-gray-500 text-lg font-medium">No providers found</p></div>
            ) : (
              providers.map((provider) => (
                <ProviderCard key={provider._id} user={provider} refresh={() => fetchProvidersBytab()} />
              ))
            )
          ) :
            tab === "dashboard" ? (
              dashboardDataLoading ? (
                <div className="flex justify-center p-10"><div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div></div>
              ) : dashboardPlace.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center"><p className="text-gray-500 text-lg font-medium">No places found</p></div>
              ) : (
                <div className="space-y-10">
                  {resorts.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                        Premium Resorts
                      </h2>
                      <Card places={resorts} setPlaces={setDashboardPlace} />
                    </div>
                  )}

                  {tourPackages.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                        Tour Packages
                      </h2>
                      <Card places={tourPackages} setPlaces={setDashboardPlace} />
                    </div>
                  )}

                  {cabServices.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-yellow-500 rounded-full"></span>
                        Cab Services
                      </h2>
                      <Card places={cabServices} setPlaces={setDashboardPlace} />
                    </div>
                  )}

                  {pgs.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                        PGs & Hostels
                      </h2>
                      <Card places={pgs} setPlaces={setDashboardPlace} />
                    </div>
                  )}

                  {remainingExplore.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                        Platform Overview
                      </h2>
                      <Card places={remainingExplore} setPlaces={setDashboardPlace} />
                    </div>
                  )}

                  {remainingUserAdded.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-teal-500 rounded-full"></span>
                        Other User Added Places
                      </h2>
                      <Card places={remainingUserAdded} setPlaces={setDashboardPlace} />
                    </div>
                  )}

                  {hotels.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-red-500 rounded-full"></span>
                        Stunning Hotels
                      </h2>
                      <Card places={hotels} setPlaces={setDashboardPlace} />
                    </div>
                  )}
                </div>
              )
            ) : tab === "users" ? (
              users.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center"><p className="text-gray-500 font-medium text-lg">No users found.</p></div>
              ) : (
                <div className="overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 font-bold uppercase text-xs tracking-wider">
                      <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4 text-right">Identifier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-lg shadow-sm border border-blue-50">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-base">{u.name}</p>
                                <p className="text-gray-500 text-sm">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-gray-400 text-xs">
                            {u._id}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : loading ? (
              <div className="flex justify-center p-10"><div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div></div>
            ) : filteredListings.length === 0 ? (
               <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center"><p className="text-gray-500 text-lg font-medium">No listings pending review.</p></div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} refresh={fetchListings} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
