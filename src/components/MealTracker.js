import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import "../styles/MealTracker.css";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

const MealTracker = () => {
  const { token } = useContext(AuthContext);
  const [meals, setMeals] = useState([]);
  const [showTrash, setShowTrash] = useState(false);
  const [form, setForm] = useState({
    mealType: "Breakfast",
    description: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [editingMeal, setEditingMeal] = useState(null);

  const BASE_URL = process.env.REACT_APP_API_URL;

  const fetchMeals = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/meals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeals(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch meals:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingMeal) {
      try {
        await axios.put(
          `${BASE_URL}/api/meals/${editingMeal._id}`,
          { ...form },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setEditingMeal(null);
        fetchMeals();
      } catch (error) {
        console.error("❌ Failed to update meal:", error);
      }
    } else {
      try {
        await axios.post(`${BASE_URL}/api/meals`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchMeals();
      } catch (error) {
        console.error("❌ Failed to add meal:", error);
      }
    }

    setForm({
      mealType: "Breakfast",
      description: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    });
  };

  const handleEdit = (meal) => {
    setForm({
      mealType: meal.mealType,
      description: meal.description,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
    });
    setEditingMeal(meal);
  };

  const handleDelete = async (mealId) => {
    const confirm = window.confirm("Are you sure you want to delete this meal?");
    if (!confirm) return;

    try {
      await axios.delete(`${BASE_URL}/api/meals/${mealId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMeals();
    } catch (error) {
      console.error("❌ Failed to delete meal:", error);
    }
  };

  const handleRestore = async (mealId) => {
    try {
      await axios.put(`${BASE_URL}/api/meals/restore/${mealId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMeals();
    } catch (error) {
      console.error("❌ Failed to restore meal:", error);
    }
  };

  const handlePermanentDelete = async (mealId) => {
    const confirm = window.confirm("Permanently delete this meal?");
    if (!confirm) return;

    try {
      await axios.delete(`${BASE_URL}/api/meals/permanent/${mealId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMeals();
    } catch (error) {
      console.error("❌ Failed to permanently delete meal:", error);
    }
  };

  const handleClearTrash = async () => {
    const confirm = window.confirm("Are you sure you want to permanently delete all trashed meals?");
    if (!confirm) return;

    try {
      await axios.delete(`${BASE_URL}/api/meals/clear-trash`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMeals();
    } catch (error) {
      console.error("❌ Failed to clear trash:", error);
    }
  };

  const chartData = meals.map((meal) => ({
    date: new Date(meal.date).toLocaleDateString(),
    calories: meal.calories || 0,
    protein: meal.protein || 0,
    carbs: meal.carbs || 0,
    fat: meal.fat || 0,
  }));

  useEffect(() => {
    fetchMeals();
  }, []);

  return (
    <div className="meal-tracker">
      <h2>🍽️ Log Your Meal</h2>
      <form onSubmit={handleSubmit}>
        <select name="mealType" value={form.mealType} onChange={handleChange}>
          <option>Breakfast</option>
          <option>Lunch</option>
          <option>Dinner</option>
          <option>Snack</option>
        </select>
        <input type="text" name="description" placeholder="Meal Description" value={form.description} onChange={handleChange} required />
        <input type="number" name="calories" placeholder="Calories" value={form.calories} onChange={handleChange} required />
        <input type="number" name="protein" placeholder="Protein (g)" value={form.protein} onChange={handleChange} />
        <input type="number" name="carbs" placeholder="Carbs (g)" value={form.carbs} onChange={handleChange} />
        <input type="number" name="fat" placeholder="Fat (g)" value={form.fat} onChange={handleChange} />
        <button type="submit">{editingMeal ? "Update Meal" : "Add Meal"}</button>
        <button type="button" onClick={() => setShowTrash(!showTrash)}>
          {showTrash ? "🔙 Back to Active Meals" : "🗑️ View Trash Bin"}
        </button>
      </form>

      <h3>{showTrash ? "🗑️ Trash Bin" : "📋 Your Meals"}</h3>

      {showTrash ? (
        <>
          <button className="clear-trash-btn" onClick={handleClearTrash}>🧹 Clear All Trash</button>
          <div className="trash-view">
            {meals.filter(meal => meal.isDeleted).map(meal => (
              <div key={meal._id} className="trash-meal-card">
                <h4>🗑️ {meal.mealType}</h4>
                <p>{meal.description} ({meal.calories} cal)</p>
                <div className="trash-actions">
                  <button className="restore-btn" onClick={() => handleRestore(meal._id)}>Restore</button>
                  <button className="delete-permanent-btn" onClick={() => handlePermanentDelete(meal._id)}>Delete Permanently</button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <ul>
          {meals.filter(meal => !meal.isDeleted).map(meal => (
            <li key={meal._id}>
              <strong>{meal.mealType}</strong> - {meal.description} ({meal.calories} cal)
              <button onClick={() => handleEdit(meal)}>Edit</button>
              <button onClick={() => handleDelete(meal._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}

      <h3>📊 Calories & Macros Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Legend />
          <Line type="monotone" dataKey="calories" stroke="#ff7300" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="protein" stroke="#00bcd4" />
          <Line type="monotone" dataKey="carbs" stroke="#82ca9d" />
          <Line type="monotone" dataKey="fat" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MealTracker;
