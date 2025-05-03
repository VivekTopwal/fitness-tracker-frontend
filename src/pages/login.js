import { useState, useContext } from "react";
import { Link,  useNavigate } from "react-router-dom";

import AuthContext from "../context/AuthContext";
import "../styles/Login.css"; // Add styling



const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  const handleGoogleLogin = () => {
    // 🔒 Connect to Firebase/OAuth here later
    alert("Google login coming soon!");
  };

  
const navigate = useNavigate();
  return (
    <div className="login-container">
      <h2 className="login-title">Welcome Back</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="login-btn" type="submit">
          Login
        </button>
      </form>


     
    
      <p className="switch-auth">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
  

      {/* <p>
  Don't have an account?{" "}
  <span onClick={() => navigate("/register")} style={{ color: "blue", cursor: "pointer" }}>
    Create one
  </span>
</p> */}

      <div className="separator">or</div>

      <button className="google-btn" onClick={handleGoogleLogin}>
        <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="G" />
        Login with Google
      </button>
    </div>
  );
};

export default Login;
