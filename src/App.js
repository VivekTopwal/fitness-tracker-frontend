import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import AuthContext from "./context/AuthContext";
import Profile from "./pages/Profile";
import Login from "./pages/login";
import Signup from "./pages/Signup";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import LoadingSpinner from "./components/LoadingSpinner";
import Settings from "./pages/Settings";
import { messaging, getToken, onMessage } from "./firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [fcmTokenSent, setFcmTokenSent] = useState(false); // Track if token is already sent

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Request permission and send FCM token to backend
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY

          });

          if (currentToken && !fcmTokenSent) {
            console.log("✅ FCM Token");

            // Send token to backend only if not already sent
            if (user) {
              await fetch(`${process.env.REACT_APP_API_URL}/api/user/fcm-token`, {

                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ token: currentToken }),
              });
              setFcmTokenSent(true); // Mark the token as sent
            }
          } else {
            console.warn("❌ No FCM token retrieved or token already sent.");
          }
        } else {
          console.warn("❌ Notification permission denied.");
        }
      } catch (err) {
        console.error("🔥 FCM error:", err);
      }
    };

    if (user && !fcmTokenSent) {
      requestPermission();
    }
  }, [user, fcmTokenSent]); // Only run when `user` or `fcmTokenSent` changes

  // Show toast on foreground message
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("📨 Message received: ", payload);
      toast.info(`🔔 ${payload.notification.title}: ${payload.notification.body}`);
    });

    return unsubscribe;
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/signup" /> : <Signup />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={["admin"]} />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

export default App;
