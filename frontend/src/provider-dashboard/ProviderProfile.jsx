import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faCamera } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import Alert from '../Alert';

export default function ProviderProfile() {
  const [profile, setProfile] = useState({
    name: "",
    contactNumber: "",
    businessName: "",
    address: "",
    description: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 3000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:8080/provider/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await response.json();
        if (data.success && data.user) {
          setProfile({
            name: data.user.name || "",
            contactNumber: data.user.providerInfo?.contactNumber || "",
            businessName: data.user.providerInfo?.businessName || "",
            address: data.user.providerInfo?.address || "",
            description: data.user.providerInfo?.description || ""
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("http://localhost:8080/provider/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(profile)
      });
      const data = await response.json();
      if (data.success) {
        showAlert("success", data.message || "Profile updated successfully!");
      } else {
        showAlert("error", data.message || "Update failed.");
      }
    } catch (err) {
      showAlert("error", "Server Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-500 font-medium">Loading profile...</div>;

  return (
    <>
      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto md:mx-0 relative z-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
          <p className="text-gray-500 mt-1">Manage your public provider information.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-8 border-b border-gray-100">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-3xl overflow-hidden shadow-sm">
                 {profile.name ? profile.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <button className="absolute inset-0 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FontAwesomeIcon icon={faCamera} className="text-xl" />
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-800">Profile Picture</h2>
              <p className="text-sm text-gray-500 mt-1">PNG, JPG under 5MB. This will be displayed to customers.</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <input type="text" name="contactNumber" value={profile.contactNumber} onChange={handleChange} placeholder="+1 (555) 123-4567" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Business Name</label>
                <input type="text" name="businessName" value={profile.businessName} onChange={handleChange} placeholder="Ocean Stay Rentals" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Business Address</label>
                <input type="text" name="address" value={profile.address} onChange={handleChange} placeholder="120 Ocean View Drive" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Description</label>
              <textarea rows="4" name="description" value={profile.description} onChange={handleChange} placeholder="We provide the best luxury stays..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"></textarea>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={saving} className={`w-full sm:w-auto text-white px-8 py-3 rounded-xl font-semibold shadow-sm flex items-center justify-center gap-2 transition-all ${saving ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 hover:shadow active:scale-95'}`}>
                <FontAwesomeIcon icon={faSave} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
