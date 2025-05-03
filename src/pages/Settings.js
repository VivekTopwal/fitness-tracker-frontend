import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import "../styles/Settings.css";

const Settings = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ Initialize with false to avoid uncontrolled input warning
  const [settings, setSettings] = useState({ notifications: false });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchSettings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Ensure fallback if no settings returned
        setSettings(res.data || { notifications: false });
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    fetchSettings();
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, checked } = e.target;

  //   setSettings((res.data && typeof res.data.notifications === "boolean")
  // ? res.data
  // : { notifications: false });

    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setError(null);

    try {
      await axios.put("http://localhost:5000/api/user/settings", settings, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMessage("✅ Settings updated successfully!");
    } catch (error) {
      setError("❌ Failed to update settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>
        <input
  type="checkbox"
  name="notifications"
  checked={!!settings.notifications} // ✅ force to boolean
  onChange={handleChange}
/>

          Enable Notifications
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Settings;
