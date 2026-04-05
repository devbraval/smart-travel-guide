import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useCooldown from "../hooks/useCooldown";
import Alert from "./Alert";

export default function Otp() {
  const navigate = useNavigate();

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

    try {
      const response = await fetch("http://localhost:8080/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, otp: finalOtp, loginToken })
      });

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message || "OTP verification failed");
        return;
      }

      // ✅ Cleanup
      localStorage.removeItem("otpEmail");
      localStorage.removeItem("loginToken");

      showAlert("success", "Login successful 🎉");

      // ✅ Role-based redirect
      const user = JSON.parse(localStorage.getItem("user"));

      if (user?.role === "admin") {
        navigate("/admin");
      } else if (user?.role === "provider") {
        navigate("/provider-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      showAlert("error", "Server error");
    }
  };

  const handleResend = async () => {
    if (isDisabled) return;

    const email = localStorage.getItem("otpEmail");
    const loginToken = localStorage.getItem("loginToken");

    try {
      const response = await fetch("http://localhost:8080/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, loginToken })
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

      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 font-sans p-6 animate-fade-in">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-soft border border-slate-100 flex flex-col items-center">
          
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Verify Code</h2>
          <p className="text-slate-500 font-medium mb-8 text-center text-sm leading-relaxed">
            We've sent a 6-digit confirmation code. <br/> Please enter it below to securely log in.
          </p>

          <div className="flex gap-2 sm:gap-3 mb-8 w-full justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                value={digit}
                maxLength={1}
                ref={(el) => (inputRef.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-600 outline-none transition-all text-slate-900 shadow-sm"
              />
            ))}
          </div>

          {message && <div className="text-red-600 bg-red-50 border border-red-100 py-3 px-4 rounded-xl text-sm font-medium w-full text-center mb-6 animate-fade-in">{message}</div>}

          <button 
            className="w-full py-4 text-center font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-md transition-all active:scale-95 mb-6" 
            onClick={handleVerifyOtp}
          >
            Authenticate
          </button>

          <p className="text-slate-500 text-sm font-medium mt-2 bg-slate-50 py-2 px-4 rounded-full border border-slate-100">
            Didn’t receive code?{" "}
            <button
              onClick={handleResend}
              disabled={isDisabled}
              className={`font-bold ml-1 transition-colors outline-none ${isDisabled ? "text-slate-400 cursor-not-allowed" : "text-primary-600 hover:text-primary-700"}`}
            >
              {isDisabled ? `Resend in ${cooldown}s` : "Request again"}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}