import logo from "./assets/newhdlogo.png";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom"
import { useState } from "react";
import useCooldown from "../hooks/useCooldown";

export default function Login() {
  const [showPass,setShowPass] = useState(false);
  const { isDisabled, cooldown, startCooldown } = useCooldown(10);

  function togglePassword(){
    setShowPass(!showPass);
  }
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [message,setMessage] = useState("");
  

  const handleLogin = async(e)=>{
    e.preventDefault();
    if (isDisabled) return;
    startCooldown();
    const response = await fetch("http://localhost:8080/login",{
      method:"POST",
      headers: {
        "Content-type":"application/json",
      },
      body:JSON.stringify({
        email,
        password,
      }),
    });
    const data = await response.json();
    if(!response.ok && data.error?.message==="User Not Founded"){
       alert("User not found. Please sign up.");
      window.location.href = "/signup";
      return;
    }
    if (!response.ok) {
    setMessage(data.error?.message || "Login failed");
    return;
  }
    localStorage.setItem("otpEmail",email);
    window.location.href="/otp"
  };
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
          <label htmlFor="email" className="form-label" >
            Email address
          </label>
          <input type="email" className="form-control" id="email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
          <div className="form-text">
            We'll never share your email with anyone else.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input type={showPass?"text":"password"} className="form-control" id="password" value={password} onChange={(e)=>setPassword(e.target.value)}/>
        </div>

        <div className="mb-3 form-check">
          <FontAwesomeIcon icon={showPass?faEyeSlash:faEye} className="icon" onClick={togglePassword}/>
          <label className="form-check-label" htmlFor="check">
            Show password
          </label>
        </div>

        <button type="submit" className="btn btn-primary w-100" onClick={handleLogin} disabled={isDisabled}>
          Login
        </button>
        <p>{message}</p>
        <div className="lower-box">
          <p>Forgot 
            <Link to="/forgot-password">Password?</Link>
          </p>
          <p>Don't have an account? {" "}
            <Link to="/signup">Sign up</Link>
          </p>
        </div>
        
      </form>
      </div>
      </div>
    </div>
  );
  
}
