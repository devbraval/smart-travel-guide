import logo from "./assets/Applogo.jpeg"
import "./Signup.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import 'bootstrap/dist/css/bootstrap.min.css';
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
export default function Signup(){
    const [showPass,setShowPass] = useState(false);
  function togglePassword(){
    setShowPass(!showPass);
  }
    return(
        
        <div className="sign-up">
              <div className="left-signup">
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
          <label htmlFor="name" className="form-label">
           Name
          </label>
          <input type="text" className="form-control" id="name" />
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
            Create Password
          </label>
          <input type={showPass?"text":"password"} className="form-control" id="password" />
          <label htmlFor="confirm-password" className="form-label">
            Confirm Password
          </label>
          <input type={showPass?"text":"password"} className="form-control" id="confirm-password" />
        </div>

        <div className="mb-3 form-check">
          <FontAwesomeIcon icon={showPass?faEyeSlash:faEye} className="icon" onClick={togglePassword}/>
          <label className="form-check-label" htmlFor="check">
            Show password
          </label>
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Sign up
        </button>
        
      </form>
      </div>
      </div>
        </div>
    )
}