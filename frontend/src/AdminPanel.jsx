import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";  // ✅ ADD THIS
import Sidebar from "./Sidebar";
import ListingCard from "./ListingCard";
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
  const userPlace = dashboardPlace.filter((p)=>p.isUserAdded);
  const defaultPlace = dashboardPlace.filter((p)=>!p.isUserAdded);
  const user = JSON.parse(localStorage.getItem("user"));

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
const fetchUser = async()=>{
  try{
    const res = await fetch("http://localhost:8080/admin/users/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if(data.success){
      setUsers(data.result);
    }
  }catch(err){
    console.error("FETCH ERROR:", err);
  }
}
useEffect(()=>{
  if(tab === "users"){
    fetchUser();
  }
},[tab]);
const fetchDashboardData = async () => {
  try{
    setDashboardDataLoading(true);
    const res = await fetch("http://localhost:8080/admin/user/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if(data.success){
      const approved = data.result.filter((place)=>place.status === "approved");
      console.log("Filtered:", approved);
      setDashboardPlace(approved);
    }
  }catch(err){
    console.error("FETCH ERROR:", err);
  }finally{
    setDashboardDataLoading(false);
  }
}
useEffect(()=>{
  if(tab==="dashboard"){
    fetchDashboardData();
  }
},[tab]);
  const filteredListings = listings.filter((l) => l.status === tab && l.owner); 

  return (
  <div className="flex">
    <Sidebar tab={tab} setTab={setTab} />

    <div className="flex-1">
      
      {/* ✅ Navbar moved to TOP */}
      <NavBar />

      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">
          {tab.toUpperCase()} LISTINGS
        </h1>

        {tab === "dashboard" ? (
          dashboardDataLoading ? (
            <p>Loading...</p>
          ) : dashboardPlace.length === 0 ? (
            <p>No places found</p>
          ) : (
            <div>
              <h2 className="text-xl font-bold px-6 mt-6">Explore Places</h2>
              <Card places={defaultPlace} setPlaces={setDashboardPlace} />

              {/* User Added Places */}
              <h2 className="text-xl font-bold px-6 mt-10">
                User Added Places
              </h2>
              <Card places={userPlace} setPlaces={setDashboardPlace} />
            </div>
          )
        ) : tab === "users" ? (
          users.length === 0 ? (
            <p>No users found</p>
          ) : (
            users.map((user) => (
              <div key={user._id} className="border p-3 mb-2 rounded">
                <p><b>{user.name}</b></p>
                <p>{user.email}</p>
                <p>Role: {user.role}</p>
              </div>
            ))
          )
        ) : loading ? (
          <p>Loading...</p>
        ) : filteredListings.length === 0 ? (
          <p>No listings found</p>
        ) : (
          filteredListings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              refresh={fetchListings}
            />
          ))
        )}
      </div>
    </div>
  </div>
);
}