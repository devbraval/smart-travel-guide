import logo from "./assets/newhdlogo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faMagnifyingGlass, faUser } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState,useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./NavBar.css";
export default function NavBar() {
  const [district, setDistrict] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
useEffect(() => {
  if (!query.trim()) {
    setSuggestions([]);
    return;
  }

  const delay = setTimeout(async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/suggestions?q=${query}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setSuggestions(data.results || []);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, 300);

  return () => clearTimeout(delay);
}, [query]);
const handleSearch = (value = query) => {
  if(!value.trim() || !value) return;
  navigate(`/search?q=${value}`);
  setShowSuggestions(false);
}

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  const closeDropdown = () => setOpen(false);
  useEffect(()=>{
    const handleClickOutside = (event) => {
      if(dropdownRef.current && !dropdownRef.current.contains(event.target)){
        setOpen(false);
      }
    };
    document.addEventListener("mousedown",handleClickOutside);
    return () => {
      document.removeEventListener("mousedown",handleClickOutside);
    };
},[]);
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-16 sm:h-20 px-4 sm:px-8 md:px-12 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">

      {/* LEFT */}
      <div className="flex items-center gap-4 sm:gap-6">
        <a href="/"><img src={logo} className="h-8 sm:h-10 cursor-pointer" /></a>
        <a href="/"><FontAwesomeIcon icon={faHouse} className="text-gray-500 hover:text-black cursor-pointer" /></a>
      </div>

      {/* SEARCH */}
      <div className="flex-1 flex justify-center px-2 sm:px-4">
        <form
  className="relative w-full max-w-lg flex items-center"
  onSubmit={(e) => {
    e.preventDefault();
    handleSearch();
  }}
>
  <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 text-gray-400" />

  <input
    className="w-full py-3 pl-11 pr-24 rounded-full border bg-gray-50"
    type="search"
    placeholder="Search for places..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    onFocus={() => setShowSuggestions(true)}
  />

  <button className="absolute right-2 px-5 bg-black text-white rounded-full py-2">
    Search
  </button>

  {/* 🔥 SUGGESTIONS DROPDOWN */}
  {showSuggestions && suggestions.length > 0 && (
    <div className="absolute top-14 w-full bg-white border rounded-lg shadow-lg z-50">
      {suggestions.map((s, i) => (
        <div
          key={i}
          className="p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            setQuery(s);
            handleSearch(s);
          }}
        >
          {s}
        </div>
      )).slice(0, 5)}
    </div>
  )}
</form>
      </div>

      {/* RIGHT - PROFILE */}
      <div  ref={dropdownRef} className="relative flex items-center">
        {user && (
          <>
            {/* 👤 ICON */}
            <div
  onClick={() => setOpen(!open)}
  className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 
             flex items-center justify-center cursor-pointer 
             shadow-sm hover:shadow-md hover:scale-105 
             transition-all duration-200"
>
  <FontAwesomeIcon icon={faUser} className="text-gray-700" />
</div>

            {/* 🔽 DROPDOWN */}
            {open && (
  <div
    className="absolute right-0 top-12 w-44 bg-white rounded-xl shadow-xl border 
               overflow-hidden transform transition-all duration-200 ease-out
               animate-dropdown"
  >
    {user.role !== "admin" && (
      <button
      onClick={() => {
        navigate("/user/status");
        setOpen(false);
      }}
      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
    >
      📊 View Status
    </button>
    )}
    

    <button
      onClick={handleLogout}
      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 transition-colors"
    >
      🚪 Logout
    </button>
    {user.role !== "admin" && (
      <button
        onClick={() => navigate("/become-provider")}
        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-600 transition-colors"
      >
        ⭐ Become Service Provider
      </button>
    )}
  </div>
)}

          </>
        )}
      </div>
    </header>
  );
}