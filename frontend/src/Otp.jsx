import { useState, useRef } from "react";
import "./Otp.css";
import useCooldown from "../hooks/useCooldown";
import Alert from "./Alert";

export default function Otp() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRef = useRef([]);
  const [message, setMessage] = useState("");

  const [alert, setAlert] = useState({ type: "", message: "" });
  const { isDisabled, cooldown, startCooldown } = useCooldown(30);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 3000);
  };

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key !== "Backspace") return;
    e.preventDefault();

    const newOtp = [...otp];
    if (newOtp[index]) {
      newOtp[index] = "";
      setOtp(newOtp);
    } else if (index > 0) {
      inputRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("");
    const email = localStorage.getItem("otpEmail");
    const loginToken = localStorage.getItem("loginToken");

    if (finalOtp.length !== 6) {
      setMessage("Please enter a complete OTP");
      return;
    }

    const response = await fetch("http://localhost:8080/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: finalOtp, loginToken }),
    });

    const data = await response.json();

    if (!data.success) {
      setMessage(data.message || "OTP verification failed");
      return;
    }

    localStorage.removeItem("otpEmail");
    localStorage.removeItem("loginToken");

    showAlert("success", "Login successful 🎉");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1200);
  };

  // ✅ FIX: send loginToken
  const handleResend = async () => {
    if (isDisabled) return;

    const email = localStorage.getItem("otpEmail");
    const loginToken = localStorage.getItem("loginToken");

    try {
      const response = await fetch("http://localhost:8080/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, loginToken }),
      });

      const data = await response.json();

      if (!data.success) {
        showAlert("error", data.message);
        return;
      }

      setOtp(new Array(6).fill(""));
      inputRef.current[0]?.focus();
      startCooldown();

      showAlert("success", "OTP resent to your email");
    } catch {
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

      <div className="otp-page">
        <div className="otp-card">
          <h2>Verify</h2>
          <p className="subtitle">Your code will be sent to you via E-mail</p>

          <div className="otp-input">
            {otp.map((digit, index) => (
              <input
                key={index}
                value={digit}
                maxLength={1}
                ref={(el) => (inputRef.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>

          <button className="verify-btn" onClick={handleVerifyOtp}>
            Verify
          </button>

          <p className="error">{message}</p>

          <p className="resend">
            Didn’t receive code?{" "}
            <span
              onClick={handleResend}
              style={{
                pointerEvents: isDisabled ? "none" : "auto",
                color: isDisabled ? "gray" : "#0d6efd",
              }}
            >
              {isDisabled ? `Resend in ${cooldown}s` : "Request again"}
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
