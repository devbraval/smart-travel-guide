import logo from "./assets/newhdlogo.png";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useState } from "react";
import useCooldown from "../hooks/useCooldown";

export default function Login() {
  const [showPass, setShowPass] = useState(false);
  const { isDisabled, startCooldown } = useCooldown(10);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function togglePassword() {
    setShowPass(!showPass);
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isDisabled) return;
    startCooldown();

    const response = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!data.success) {
      setMessage(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("otpEmail", email);
    localStorage.setItem("loginToken", data.loginToken);
    localStorage.setItem("userId", data.userId);

    window.location.href = "/otp";
  };

  return (
    <div className="login">
      
      {/* LEFT */}
      <div className="left">
        <img src={logo} alt="logo" />
        <h1>Smart Travel Guide 🌍</h1>
        <p>
          Discover famous places, local food, temples, museums, and hidden gems
          tailored to your district using AI-powered recommendations.
        </p>
      </div>

      {/* RIGHT */}
      <div className="right">
        <div className="card-box">

          <h2>Welcome Back 👋</h2>
          <p className="subtitle">Login to continue planning your journey</p>

          <form onSubmit={handleLogin}>

            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="show-pass">
              <FontAwesomeIcon
                icon={showPass ? faEyeSlash : faEye}
                onClick={togglePassword}
              />
              <span>Show password</span>
            </div>

            <button disabled={isDisabled}>Login</button>

            {message && <p className="error">{message}</p>}

            <div className="links">
              <p>Forgot <Link to="/forgot-password">Password?</Link></p>
              <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}