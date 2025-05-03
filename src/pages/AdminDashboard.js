import { useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";

const AdminDashboard = () => {
  const { user, role } = useContext(AuthContext);

  useEffect(() => {
    console.log("🔍 AdminDashboard - User:", user);
    console.log("🔍 AdminDashboard - Role:", role);
  }, [user, role]);

  if (!user || role !== "admin") {
    console.log("❌ Access Denied!");
    return <h1>Access Denied</h1>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Welcome, {user?.name}! You have admin access.</p>
    </div>
  );
};

export default AdminDashboard;
