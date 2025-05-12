import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { auth, provider, signInWithPopup } from "../firebase";

const AuthContext = createContext();
const BASE_URL = process.env.REACT_APP_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (storedUser && storedToken && storedRefreshToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
      setRole(parsedUser.role);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);
      setToken(res.data.accessToken);
      setRefreshToken(res.data.refreshToken);
      setRole(res.data.user.role);
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data?.message || "Unknown error");
    }
  };

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      const res = await axios.post(`${BASE_URL}/api/auth/google-login`, {
        email: googleUser.email,
        name: googleUser.displayName,
        avatar: googleUser.photoURL,
        uid: googleUser.uid,
      });

      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);
      setToken(res.data.accessToken);
      setRefreshToken(res.data.refreshToken);
      setRole(res.data.user.role);
    } catch (error) {
      console.error("❌ Google login failed:", error.message);
    }
  };

  const logout = useCallback(async () => {
    try {
      if (refreshToken) {
        await axios.post(`${BASE_URL}/api/auth/logout`, { token: refreshToken }, { withCredentials: true });
      }
    } catch (error) {
      console.error("❌ Logout failed:", error.response?.data?.message || "Unknown error");
    }

    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setRole(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }, [refreshToken]);

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) {
      console.error("🚨 No refresh token available.");
      logout();
      return null;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/refresh`,
        { token: refreshToken },
        { withCredentials: true }
      );

      console.log("✅ Access token refreshed:", res.data.accessToken);
      localStorage.setItem("token", res.data.accessToken);
      setToken(res.data.accessToken);
      return res.data.accessToken;
    } catch (error) {
      console.error("❌ Refresh token failed. Logging out.", error);
      logout();
      return null;
    }
  }, [refreshToken, logout]);

  useEffect(() => {
    const axiosInstance = axios.create();

    axiosInstance.interceptors.request.use(
      async (config) => {
        if (!token) {
          const newToken = await refreshAccessToken();
          if (!newToken) logout();
          config.headers.Authorization = `Bearer ${newToken}`;
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 403 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newAccessToken = await refreshAccessToken();
          if (newAccessToken) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );
  }, [token, refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        refreshToken,
        role,
        login,
        googleLogin,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
