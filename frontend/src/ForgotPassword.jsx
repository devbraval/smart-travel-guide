import { useState } from "react";
import "./ForgotPassword.css";
import logo from "./assets/newhdlogo.png";
import Alert from "./Alert";
import useCooldown from "../hooks/useCooldown";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });
  const { isDisabled, startCooldown } = useCooldown(30);

  // ✅ FIXED
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert({ type: "", message: "" });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDisabled) return;

    if (!email) {
      showAlert("error", "Email is required");
      return;
    }

    startCooldown();

    try {
      const response = await fetch("http://localhost:8080/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        showAlert("error", data.message || "Failed to send OTP");
        return;
      }

      localStorage.setItem("resetEmail", email);
      showAlert("success", data.message || "OTP sent to email");

      setTimeout(() => {
        window.location.href = "/verify-reset-otp";
      }, 2000);
    } catch (err) {
      showAlert("error", "Server not reachable");
    }
  };

  return (
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      <div className="forgot-page">
        <div className="left-forgot">
          <img src={logo} alt="logo" />
          <h1>Smart Travel Guide 🌍</h1>
          <p>
            Discover famous places, local food, temples, museums, and hidden gems
            tailored to your district using AI-powered recommendations.
          </p>
        </div>

        <div className="right-forgot">
          <form className="forgot-form" onSubmit={handleSubmit}>
            <h3>Enter your E-mail to proceed</h3>

            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Enter the E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isDisabled}
            >
              Proceed
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
