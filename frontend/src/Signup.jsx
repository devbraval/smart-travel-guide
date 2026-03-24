import logo from "./assets/newhdlogo.png";
import "./Signup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "bootstrap/dist/css/bootstrap.min.css";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import useCooldown from "../hooks/useCooldown";
import { Link } from "react-router-dom";

export default function Signup() {
  const [showPass, setShowPass] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const { isDisabled, startCooldown } = useCooldown(10);

  function togglePassword() {
    setShowPass(!showPass);
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    if (isDisabled) return;
    startCooldown();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    const response = await fetch("http://localhost:8080/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!data.success) {
      setMessage(data.message || "Signup failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("otpEmail", email);
    localStorage.setItem("userId", data.userId);

    window.location.href = "/otp";
  };

  return (
    <div className="sign-up">
      
      {/* LEFT */}
      <div className="left-signup">
        <img src={logo} alt="logo" />
        <h1>Smart Travel Guide 🌍</h1>
        <p>
          Discover famous places, local food, temples, museums, and hidden gems
          tailored to your district using AI-powered recommendations.
        </p>
      </div>

      {/* RIGHT */}
      <div className="right-signup">
        <div className="signup-card">

          <h2>Welcome 👋</h2>
          <p className="subtitle">Signup to continue planning your journey</p>

          <form onSubmit={handleSignup}>

            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <small className="form-text">
              We'll never share your email with anyone else.
            </small>

            <label>Create Password</label>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label>Confirm Password</label>
            <input
              type={showPass ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="show-pass">
              <FontAwesomeIcon
                icon={showPass ? faEyeSlash : faEye}
                onClick={togglePassword}
              />
              <span>Show password</span>
            </div>

            <button disabled={isDisabled}>Sign up</button>

            {message && <p className="error">{message}</p>}

            <div className="links">
              <p>
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}