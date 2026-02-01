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

    localStorage.setItem("otpEmail", email);
    window.location.href = "/otp";
  };

  return (
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
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                onChange={(e) => setName(e.target.value)}
              />

              <label className="form-label mt-2">Email address</label>
              <input
                type="email"
                className="form-control"
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="form-text">
                We'll never share your email with anyone else.
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Create Password</label>
              <input
                type={showPass ? "text" : "password"}
                className="form-control"
                onChange={(e) => setPassword(e.target.value)}
              />

              <label className="form-label mt-2">Confirm Password</label>
              <input
                type={showPass ? "text" : "password"}
                className="form-control"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="mb-3 form-check">
              <FontAwesomeIcon
                icon={showPass ? faEyeSlash : faEye}
                className="icon"
                onClick={togglePassword}
              />
              <label className="form-check-label ms-2">
                Show password
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              onClick={handleSignup}
              disabled={isDisabled}
            >
              Sign up
            </button>

            <p className="text-danger mt-2">{message}</p>

            <p className="mt-3">
              Already have an account?{" "}
              <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
