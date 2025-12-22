import logo from "./assets/Applogo.jpeg";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function Login() {
  const [showPass,setShowPass] = useState(false);
  function togglePassword(){
    setShowPass(!showPass);
  }
  
  return (
    <div className="login">
      <div className="left-login">
          <img src={logo} alt="logo" />
           <h1>Smart Travel Guide 🌍</h1>
            <p>
          Discover famous places, local food, temples, museums, and hidden gems
          tailored to your district using AI-powered recommendations.
            </p>
      </div>
      <div className="right-login">
        <div className="login-box">
          <h2>Welcome Back 👋</h2>
          <p className="subtitle">Login to continue planning your journey</p>
        <form className="login-form">
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input type="email" className="form-control" id="email" />
          <div className="form-text">
            We'll never share your email with anyone else.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input type={showPass?"text":"password"} className="form-control" id="password" />
        </div>

        <div className="mb-3 form-check">
          <FontAwesomeIcon icon={showPass?faEyeSlash:faEye} className="icon" onClick={togglePassword}/>
          <label className="form-check-label" htmlFor="check">
            Show password
          </label>
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Submit
        </button>
        <div className="lower-box">
          <p>Forgot <a href="">Password?</a></p>
          <p>Don't have an account? <a href="">Sign up</a></p>
        </div>
        
      </form>
      </div>
      </div>
    </div>
  );
  
}
