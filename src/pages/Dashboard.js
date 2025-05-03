// Dashboard.js

import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaChartBar, FaCog } from "react-icons/fa";
import AuthContext from "../context/AuthContext";
import axios from "axios";


import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import WorkoutTracker from "../components/WorkoutTracker";
import MealTracker from "../components/MealTracker";
import AiWorkoutPlanner from "../components/AiWorkoutPlanner";
import AiMealPlanner from "../components/AiMealPlanner";
import "../styles/Dashboard.css";
import SavedMealPlans from "../components/SavedMealPlans";




// ==== MAIN DASHBOARD COMPONENT ====
const Dashboard = () => {
  const { user, token, logout, setAuthState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        console.error("🚨 No token found. User might not be authenticated.");
        return;
      }


      try {
        const res =await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

       // console.log("✅ Dashboard data received:", res.data);
        setDashboardData(res.data);
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error.response?.data || error);

        if (error.response?.status === 403) {
          console.log("🔄 Token expired, refreshing...");

          try {
            const refreshRes =await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/refresh`, {
              refreshToken: localStorage.getItem("refreshToken"),
            });

            const newToken = refreshRes.data.accessToken;
            localStorage.setItem("token", newToken);
            setAuthState((prev) => ({ ...prev, token: newToken }));

            console.log("✅ Token refreshed. Retrying request...");
            return fetchDashboardData();
          } catch (refreshError) {
            console.error("🚨 Refresh token failed. Logging out.", refreshError);
            logout();
          }
        }

        setError("Failed to load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, setAuthState, logout]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-card">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  const chartData = [
    { name: "Workouts", value: dashboardData?.userStats.totalWorkouts || 0 },
    { name: "Calories", value: dashboardData?.userStats.caloriesBurned || 0 },
    { name: "Active Days", value: dashboardData?.userStats.activeDays || 0 },
  ];

  const lineChartData = dashboardData?.dailyWorkouts || [];

  const pieChartData = [
    { name: "Cardio", value: dashboardData?.activityDistribution?.cardio || 0 },
    { name: "Strength", value: dashboardData?.activityDistribution?.strength || 0 },
    { name: "Flexibility", value: dashboardData?.activityDistribution?.flexibility || 0 },
  ];

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Dashboard</h2>
        <ul>
          <li><Link to="/profile"><FaUser /> Profile</Link></li>
          <li><Link to="/dashboard"><FaChartBar /> Analytics</Link></li>
          <li><Link to="/settings"><FaCog /> Settings</Link></li>
          <li><button onClick={handleLogout}><FaSignOutAlt /> Logout</button></li>
        </ul>
      </aside>

      <main className="dashboard-content">
        <h1>Welcome, {user?.name || "Guest"}!</h1>
        <p>Your role: {user?.role || "Not assigned"}</p>

        <div className="workout-tracker-container">
          <WorkoutTracker />
        </div>

        <div className="meal-tracker-container">
          <MealTracker />
          <AiMealPlanner />
        </div>

        {/* Saved Meal Plans */}
        <SavedMealPlans token={token} />

        <div className="stats">
          <h3>Your Stats</h3>
          <p>🏋️ Total Workouts: {dashboardData?.userStats.totalWorkouts}</p>
          <p>🔥 Calories Burned: {dashboardData?.userStats.caloriesBurned}</p>
          <p>📆 Active Days: {dashboardData?.userStats.activeDays}</p>
        </div>

        <div className="ai-planner-container">
          <AiWorkoutPlanner />
        </div>

        <div className="chart-container">
          <h3>Fitness Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Workout Progress (Line Chart)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="workouts" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={3} dot={{ r: 6, fill: '#8884d8' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Activity Distribution (Pie Chart)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#82ca9d"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? "#82ca9d" : "#8884d8"} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <ul>
            {dashboardData?.recentActivity?.map((activity) => (
              <li key={activity.id}>
                <strong>{activity.type}:</strong> {activity.description} ({activity.date})
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
