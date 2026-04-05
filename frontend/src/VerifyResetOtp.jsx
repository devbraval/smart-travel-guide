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

      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 font-sans p-6 animate-fade-in">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-soft border border-slate-100 flex flex-col items-center text-center">
          
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Verify Code</h2>
          <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">
            We've sent a 6-digit confirmation code. <br/> Please enter it below to securely confirm.
          </p>

          <div className="flex gap-2 sm:gap-3 mb-8 w-full justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                value={digit}
                maxLength={1}
                ref={(el) => (userRef.current[index] = el)}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-600 outline-none transition-all text-slate-900 shadow-sm"
              />
            ))}
          </div>

          <button 
            className={`w-full py-4 text-center font-bold text-white rounded-xl shadow-md transition-all active:scale-95 mb-6 ${loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-lg'}`} 
            onClick={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Authenticate'}
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
