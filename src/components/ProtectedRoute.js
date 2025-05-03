import { Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { user, role } = useContext(AuthContext);

  console.log("🔍 Checking ProtectedRoute:", { user, role, allowedRoles });

  if (!user) {
    console.log("❌ User not logged in. Redirecting to /login");
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    console.log(`❌ Access denied! User role: ${role}. Allowed roles: ${allowedRoles}`);
    return <Navigate to="/dashboard" />;
  }

  console.log("✅ Access granted!");
  return element;
};

export default ProtectedRoute;
