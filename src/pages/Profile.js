import { useContext, useState, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import "../styles/Profile.css";

const Profile = () => {
  const { user, setUser, token, refreshAccessToken, logout } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    fitnessGoal: "",
    password: "",
    profilePic: "/default-profile.png",
  });
  const [loading, setLoading] = useState(false);


  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name ?? "",
        bio: user.bio ?? "", // ✅ Empty if not provided
        fitnessGoal: user.fitnessGoal ?? "", // ✅ Empty if not provided
        password: "", // ✅ Always empty
        profilePic: user.profilePic || "/default-profile.png",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let currentToken = token;
      if (!token) {
        currentToken = await refreshAccessToken();
        if (!currentToken) {
          alert("Session expired. Please log in again.");
          return logout();
        }
      }

      const { password, ...updateData } = formData;
      if (!password) delete updateData.password; // ✅ Ensure password isn't sent if empty

      const res = await axios.put(
        `${BASE_URL}/api/user/update`,
        updateData,
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );

      setUser((prevUser) => ({
        ...prevUser,
        name: res.data.name ?? prevUser.name,
        bio: res.data.bio ?? prevUser.bio,
        fitnessGoal: res.data.fitnessGoal ?? prevUser.fitnessGoal,
        profilePic: res.data.profilePic ?? prevUser.profilePic,
      }));

      setFormData((prevData) => ({
        ...prevData,
        bio: res.data.bio ?? "",
        fitnessGoal: res.data.fitnessGoal ?? "",
        password: "", // ✅ Keep password field empty after update
      }));

      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("❌ Update failed:", error.response?.data || error.message);
      alert("❌ Update failed: " + (error.response?.data?.message || "An error occurred"));
    }

    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !token) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const res = await axios.put(`${BASE_URL}/api/user/upload-profile-pic`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setUser((prevUser) => ({ ...prevUser, profilePic: res.data.profilePic }));
      setFormData((prevData) => ({ ...prevData, profilePic: res.data.profilePic }));
    } catch (error) {
      console.error("❌ Upload failed:", error.response?.data || error);
      alert("❌ Image upload failed: " + (error.response?.data?.message || "An error occurred"));
    }

    setLoading(false);
  };

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>

      <div className="profile-pic-container">
        <img
          src={formData.profilePic.startsWith("/uploads") ? `${BASE_URL}${formData.profilePic}` : formData.profilePic}
          alt="Profile"
          className="profile-pic"
          onError={(e) => (e.target.src = "/default-profile.png")}
        />
        <input type="file" accept="image/*" onChange={handleFileUpload} />
      </div>

      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Bio:</strong> {formData.bio || "No bio added yet."}</p> 
      <p><strong>Fitness Goal:</strong> {formData.fitnessGoal || "No goal set yet."}</p> 

      <form onSubmit={handleUpdate}>
        <label>Name:</label>
        <input name="name" value={formData.name} onChange={handleChange} />

        <label>Bio:</label>
        <textarea 
          name="bio" 
          value={formData.bio} 
          onChange={handleChange} 
          placeholder="Tell us about yourself..."
        ></textarea>

        <label>Fitness Goal:</label>
        <input 
          name="fitnessGoal" 
          value={formData.fitnessGoal} 
          onChange={handleChange} 
          placeholder="E.g., Lose weight, Gain muscle" 
        />

        <label>New Password:</label>
        <div className="password-container">
          <input 
            type={showPassword ? "text" : "password"} 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            autoComplete="new-password" // ✅ Prevents autofill
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button type="submit" disabled={loading}>{loading ? "Updating..." : "Update Profile"}</button>
      </form>

      <button className="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
};

export default Profile;
