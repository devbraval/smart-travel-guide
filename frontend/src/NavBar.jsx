import logo from "./assets/newhdlogo.png";
import "./NavBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";

export default function NavBar() {
  return (
    <header className="navbar-container">
      <div className="nav-left">
        <img src={logo} alt="Smart Travel" className="nav-logo" />
        <FontAwesomeIcon icon={faHouse} className="home-icon" title="Home" />
      </div>

      <div className="nav-center">
        <form className="search-form" onSubmit={(e) => e.preventDefault()}>
          <input
            className="search-input"
            type="search"
            placeholder="Search places..."
          />
          <button className="search-btn">Search</button>
        </form>
      </div>

      <div className="nav-right">
        {/* Placeholder for future auth/profile items */}
      </div>
    </header>
  );
}
