import "./Otp.css";
import Alert from "./Alert";
import useCooldown from "../hooks/useCooldown";
import { useState, useRef } from "react";

export default function VerifyResetOtp() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const userRef = useRef([]);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({ type: "", message: "" });
  const { isDisabled, cooldown, startCooldown } = useCooldown(30);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 3000);
  };

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      userRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      userRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    if (loading) return;

    const finalOtp = otp.join("");
    const email = localStorage.getItem("resetEmail");

    if (finalOtp.length !== 6) {
      showAlert("error", "Enter complete OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:8080/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: finalOtp }),
      });

      const data = await response.json();

      if (!data.success) {
        showAlert("error", data.message);
        return;
      }

      localStorage.setItem("resetToken", data.resetToken);

      showAlert("success", "OTP verified");

      setTimeout(() => {
        window.location.href = "/reset-password";
      }, 1000);
    } catch {
      showAlert("error", "Server error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: use old /resend-otp route
  const handleResend = async () => {
    if (isDisabled) return;

    const email = localStorage.getItem("resetEmail");

    try {
      const response = await fetch("http://localhost:8080/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        showAlert("error", data.message);
        return;
      }

      setOtp(new Array(6).fill(""));
      userRef.current[0]?.focus();
      startCooldown();

      showAlert("success", "OTP resent");
    } catch {
      showAlert("error", "Server not reachable");
    }
  };

  return (
    <>
      <Alert {...alert} onClose={() => setAlert({})} />

      <div className="otp-page">
        <div className="otp-card">
          <h2>Verify OTP</h2>

          <div className="otp-input">
            {otp.map((digit, index) => (
              <input
                key={index}
                maxLength={1}
                value={digit}
                ref={(el) => (userRef.current[index] = el)}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>

          <button
            className="verify-btn"
            onClick={handleVerifyOtp}
            disabled={loading}
          >
            Verify
          </button>

          <p className="resend">
            Didn’t receive code?{" "}
            <span
              onClick={handleResend}
              style={{
                color: isDisabled ? "gray" : "#0d6efd",
                pointerEvents: isDisabled ? "none" : "auto",
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
