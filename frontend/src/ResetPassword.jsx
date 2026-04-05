import Alert from "./Alert";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const togglePassword = () => setShowPassword(!showPassword);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 3000);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!password || !confirmPass) {
      showAlert("error", "All input fields are required");
      return;
    }

    if (password !== confirmPass) {
      showAlert("error", "Passwords do not match");
      return;
    }

    const email = localStorage.getItem("resetEmail");
    const resetToken = localStorage.getItem("resetToken");

    if (!email || !resetToken) {
      showAlert("error", "Session expired. Please start again.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:8080/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, password }),
      });

      const data = await response.json();

      if (!data.success) {
        showAlert("error", data.message || "Password reset failed");
        return;
      }

      showAlert("success", "Password changed successfully");

      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetToken");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch {
      showAlert("error", "Server error");
    } finally {
      setLoading(false);
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
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Create New Password</h2>
          <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">
            Your new password must be uniquely yours. Please type it completely twice.
          </p>

          <form className="w-full space-y-4" onSubmit={handleResetPassword}>
            <div className="text-left space-y-1.5 relative">
              <label className="text-sm font-semibold text-slate-700">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 bg-slate-50 focus:bg-white outline-none transition-all text-slate-900 shadow-sm"
                />
                <button 
                  type="button" 
                  onClick={togglePassword} 
                  className="absolute inset-y-0 right-0 px-4 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors outline-none"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div className="text-left space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 bg-slate-50 focus:bg-white outline-none transition-all text-slate-900 shadow-sm"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 px-4 font-bold rounded-xl shadow-md transition-all mt-4 ${loading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg hover:-translate-y-0.5 active:scale-95'}`}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
