import { useState } from "react";
import {Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css"; // Create or reuse styles

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });

      if (res.data) {
        setSuccess("🎉 Account created successfully! Please log in.");
        setTimeout(() => navigate("/login"), 2000); // Redirect to login
      }
    } catch (err) {
      console.error(err);
      setError("❌ Registration failed. Email may already exist.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      {success && <p className="success-message">{success}</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>

      <p className="switch-auth">
  Already have an account? <Link to="/login">Login</Link>
</p>



      {/* <p>
        Already have an account?{" "}
        <span className="link" onClick={() => navigate("/login")}>
          Login here
        </span>
      </p> */}
    </div>
  );
};

export default Register;
