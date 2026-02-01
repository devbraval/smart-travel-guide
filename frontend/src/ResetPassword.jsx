import "bootstrap/dist/css/bootstrap.min.css";
import Alert from "./Alert";
import logo from "./assets/newhdlogo.png";
import { useState } from "react";
import "./ResetPassword.css";
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

      <div className="pass">
        <div className="left-pass">
          <img src={logo} alt="logo" />
          <h1>Smart Travel Guide 🌍</h1>
        </div>

        <div className="right-pass">
          <div className="pass-box">
            <form className="pass-form" onSubmit={handleResetPassword}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control mb-3"
                placeholder="New password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <input
                type={showPassword ? "text" : "password"}
                className="form-control mb-3"
                placeholder="Confirm password"
                onChange={(e) => setConfirmPass(e.target.value)}
              />

              <div className="mb-3">
                <FontAwesomeIcon
                  icon={showPassword ? faEye : faEyeSlash}
                  className="icon"
                  onClick={togglePassword}
                />
                <span className="ms-2">Show password</span>
              </div>

              <button className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
