import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import logo from "./assets/newhdlogo.png";
import "./NavBar.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";

export default function NavBar() {
  return (
    <nav className="navbar-expand-lg bg-body-tertiary ">
      <div className="container-fluid ">
        <div className="nav">
        <div className='nav-left'>
       <img src={logo} alt="logo" />
       <FontAwesomeIcon icon={faHouse} id='icon'/>
       </div>
       <div className="nav-center">
            <form className="d-flex">
                <input className="form-control me-2" type="search" placeholder="Search" />
                <button className="btn btn-outline-success">Search</button>
            </form>
        </div>
            <div className="nav-right">
                
            
       </div>
       </div>
        </div>
    </nav>
  );
}
