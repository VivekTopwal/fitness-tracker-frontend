import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthContext from "../context/AuthContext";
import "../styles/Login.css";

const Login = () => {
  const { login, googleLogin } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  await login(email, password);
  navigate("/dashboard"); // or wherever your main screen is
};

const handleGoogleLogin = async () => {
  await googleLogin();
  navigate("/dashboard");
};


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

      <div className="separator">or</div>

      <button className="google-btn" onClick={handleGoogleLogin}>
        <img
          src="https://img.icons8.com/color/16/000000/google-logo.png"
          alt="G"
        />
        Login with Google
      </button>
    </div>
  );
};

export default Login;
