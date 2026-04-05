import { useState } from "react";
import logo from "./assets/newhdlogo.png";
import Alert from "./Alert";
import useCooldown from "../hooks/useCooldown";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });
  const { isDisabled, startCooldown } = useCooldown(30);

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

      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 font-sans p-6 animate-fade-in">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-soft border border-slate-100 flex flex-col items-center text-center">
          
          <div className="w-16 h-16 bg-indigo-50 flex items-center justify-center rounded-full mb-6">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password?</h2>
          <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">
            No worries! Enter your email address and we will securely send you a code to reset your password.
          </p>

          <form className="w-full space-y-4" onSubmit={handleSubmit}>
            <div className="text-left space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email address</label>
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 bg-slate-50 focus:bg-white outline-none transition-all text-slate-900 shadow-sm"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 px-4 font-bold rounded-xl shadow-md transition-all mt-2 ${isDisabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg hover:-translate-y-0.5 active:scale-95'}`}
              disabled={isDisabled}
            >
              {isDisabled ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>

          <Link to="/login" className="mt-6 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors flex items-center justify-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to login
          </Link>
        </div>
      </div>
    </>
  );
}
