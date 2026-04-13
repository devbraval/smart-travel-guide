import logo from "./assets/newhdlogo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import useCooldown from "../hooks/useCooldown";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
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

    navigate("/otp");
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-50">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-white border-r border-slate-200 relative overflow-hidden flex-col justify-center items-center p-12">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="z-10 w-full max-w-xl flex flex-col items-center text-center">

          <img
            src={logo}
            alt="logo"
            className="h-40 mb-6 drop-shadow-xl"
          />
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Smart Travel Guide <span className="text-indigo-600">🌍</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed font-medium">
            Discover famous places, local food, temples, museums, and hidden gems
            tailored to your district using AI-powered recommendations.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-soft border border-slate-100 relative z-10 w-full my-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Account 👋</h2>
          <p className="text-slate-500 font-medium mb-8">Sign up to start planning your journeys</p>

          <form onSubmit={handleSignup} className="space-y-4">

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                value={name}
                required
                placeholder="John Doe"
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 bg-slate-50 focus:bg-white outline-none transition-all text-slate-900 shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email address</label>
              <input
                type="email"
                value={email}
                required
                placeholder="you@domain.com"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 bg-slate-50 focus:bg-white outline-none transition-all text-slate-900 shadow-sm"
              />
              <p className="text-xs text-slate-400 font-medium">We'll never share your email with anyone else.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Create Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  required
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 bg-slate-50 focus:bg-white outline-none transition-all text-slate-900 shadow-sm"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute inset-y-0 right-0 px-4 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors outline-none"
                >
                  <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
              <input
                type={showPass ? "text" : "password"}
                value={confirmPassword}
                required
                placeholder="••••••••"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 bg-slate-50 focus:bg-white outline-none transition-all text-slate-900 shadow-sm"
              />
            </div>

            {message && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl text-center animate-fade-in">{message}</div>}

            <button
              disabled={isDisabled}
              className={`w-full mt-2 py-3.5 px-4 font-bold rounded-xl shadow-md transition-all ${isDisabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg hover:-translate-y-0.5 active:scale-95'}`}
            >
              {isDisabled ? 'Please wait...' : 'Sign up'}
            </button>

            <div className="pt-4 text-center text-sm font-medium text-slate-600">
              Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 transition-colors ml-1">Login</Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}