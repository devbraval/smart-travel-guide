import logo from "./assets/newhdlogo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useCooldown from "../hooks/useCooldown";

export default function Login() {
  const navigate = useNavigate();

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

    try {
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

      // ✅ Store everything properly
      localStorage.setItem("token", data.token);
      localStorage.setItem("otpEmail", email);
      localStorage.setItem("loginToken", data.loginToken);
      localStorage.setItem("userId", data.userId);

      // 🔥 IMPORTANT FIX
      localStorage.setItem("user", JSON.stringify({
        role: data.role,
        email: email
      }));

      // ✅ Go to OTP page
      navigate("/otp");

    } catch (err) {
      setMessage("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-50">
      
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-white border-r border-slate-200 relative overflow-hidden flex-col justify-center items-center p-12">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="z-10 w-full max-w-lg">
          <img src={logo} alt="logo" className="h-10 mb-8" />
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
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-soft border border-slate-100 relative z-10 w-full">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back 👋</h2>
          <p className="text-slate-500 font-medium mb-8">Login to continue planning your journey</p>

          <form onSubmit={handleLogin} className="space-y-5">
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
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-sm font-semibold text-slate-700">Password</label>
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

            {message && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl text-center animate-fade-in">{message}</div>}

            <button 
              disabled={isDisabled} 
              className={`w-full py-3.5 px-4 font-bold rounded-xl shadow-md transition-all ${isDisabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg hover:-translate-y-0.5 active:scale-95'}`}
            >
              {isDisabled ? 'Please wait...' : 'Login'}
            </button>

            <div className="pt-4 flex flex-col sm:flex-row justify-between items-center text-sm font-medium text-slate-600 gap-3">
              <Link to="/forgot-password" className="text-slate-500 hover:text-primary-600 transition-colors">Forgot Password?</Link>
              <span className="text-slate-400">
                Don't have an account? <Link to="/signup" className="text-primary-600 hover:text-primary-700 transition-colors ml-1">Sign up</Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}