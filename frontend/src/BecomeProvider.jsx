import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BecomeProvider.css";

export default function BecomeProvider() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    businessName: "",
    contactNumber: "",
    state: "",
    district: "",
    address: "",
    description: "",
    serviceType: "",
    propertyCount: 1,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      const res = await fetch("http://localhost:8080/become-provider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setError("");

        // Optional redirect after 2 sec
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError(data.message || "Failed to submit request.");
        setMessage("");
      }
    } catch (err) {
      setError("Server error. Try again.");
    }
  };

  return (
    <div className="provider-container">
      <div className="provider-card">
        <h2 className="provider-title">Become a Service Provider</h2>
        <p className="provider-subtitle">
          Start listing your services and grow your business 🚀
        </p>

        {/* ✅ SUCCESS MESSAGE */}
        {message && <div className="success-msg">{message}</div>}

        {/* ❌ ERROR MESSAGE */}
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="provider-form">
          <div className="form-group">
            <label>Business Name</label>
            <input
              type="text"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Service Type</label>
              <select
                name="serviceType"
                value={form.serviceType}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="hotel">Hotel</option>
                <option value="villa">Villa</option>
                <option value="restaurant">Restaurant</option>
                <option value="guide">Guide</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>District</label>
              <input
                type="text"
                name="district"
                value={form.district}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Full Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Number of Properties</label>
            <input
              type="number"
              name="propertyCount"
              value={form.propertyCount}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <button type="submit" className="submit-btn">
            Submit Request 🚀
          </button>
        </form>
      </div>
    </div>
  );
}