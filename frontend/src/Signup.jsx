import logo from "./assets/newhdlogo.png";
import "./Signup.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import 'bootstrap/dist/css/bootstrap.min.css';
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import useCooldown from "../hooks/useCooldown";
export default function Signup(){
  const [showPass,setShowPass] = useState(false);
  const [name,setName] = useState("");
  const [password,setPassword] = useState("");
  const [email,setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const { isDisabled, cooldown, startCooldown } = useCooldown(10);

  function togglePassword(){
    setShowPass(!showPass);
  }
  const handleSignup= async(e)=>{
    e.preventDefault();
    if(isDisabled)return;
    startCooldown();
    if(password!=confirmPassword){
      setMessage("Passwords do not match");
      return;
    }
    const response = await fetch("http://localhost:8080/signup",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name,email,password}),
    });
    const data = await response.json();

    if (!response.ok && data.error?.message === "User Already Exists!") {
    setMessage("User already exists. Please login.");
    return;
  }
  if (!response.ok) {
    setMessage(data.error?.message || "Signup failed");
    return;
  }
    localStorage.setItem("otpEmail",email);
    window.location.href="/otp";
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
              <div className="right-signup">
        <div className="login-box">
          <h2>Welcome 👋</h2>
          <p className="subtitle">Signup to continue planning your journey</p>
        <form className="login-form">
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
           Name
          </label>
          <input type="text" className="form-control" id="name" onChange={(e)=>setName(e.target.value)}/>
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input type="email" className="form-control" id="email" onChange={(e)=>setEmail(e.target.value)} />
          <div className="form-text">
            We'll never share your email with anyone else.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Create Password
          </label>
          <input type={showPass?"text":"password"} className="form-control" id="password" onChange={(e)=>setPassword(e.target.value)}/>
          <label htmlFor="confirm-password" className="form-label">
            Confirm Password
          </label>
          <input type={showPass?"text":"password"} className="form-control" id="confirm-password" onChange={(e)=>setConfirmPassword(e.target.value)} />
        </div>

        <div className="mb-3 form-check">
          <FontAwesomeIcon icon={showPass?faEyeSlash:faEye} className="icon" onClick={togglePassword}/>
          <label className="form-check-label" htmlFor="check">
            Show password
          </label>
        </div>

        <button type="submit" className="btn btn-primary w-100" onClick={handleSignup} disabled={isDisabled}>
          Sign up
        </button>
        
      </form>
      </div>
      </div>
        </div>
    )
}