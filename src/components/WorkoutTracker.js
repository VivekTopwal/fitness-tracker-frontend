import { useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import "../styles/WorkoutTracker.css";

const BASE_URL = process.env.REACT_APP_API_URL;


const WorkoutTracker = () => {
  const { token } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  const [newWorkout, setNewWorkout] = useState({ exercise: "", sets: "", reps: "", weight: "" });
  const [editingId, setEditingId] = useState(null);
  const [editedWorkout, setEditedWorkout] = useState({});

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/workouts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkouts(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch workouts:", err);
    }
  };

  const handleNewChange = (field, value) => {
    setNewWorkout({ ...newWorkout, [field]: value });
  };

  const handleEditChange = (field, value) => {
    setEditedWorkout({ ...editedWorkout, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting workout:", newWorkout);
    try {
      const res = await axios.post(`${BASE_URL}/api/workouts`, {
        exercise: newWorkout.exercise,
        sets: Number(newWorkout.sets),
        reps: Number(newWorkout.reps),
        weight: Number(newWorkout.weight),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setWorkouts([res.data, ...workouts]);
      setNewWorkout({ exercise: "", sets: "", reps: "", weight: "" });
    } catch (err) {
      console.error("❌ Failed to add workout:", err.response?.data || err.message);
    }
  };
  

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/workouts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkouts(workouts.filter((w) => w._id !== id));
    } catch (err) {
      console.error("❌ Failed to delete workout:", err);
    }
  };

  const startEditing = (workout) => {
    setEditingId(workout._id);
    setEditedWorkout(workout);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedWorkout({});
  };

  const saveEdit = async (id) => {
    try {
      const res = await axios.put(`${BASE_URL}/api/workouts/${id}`, editedWorkout, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkouts(workouts.map((w) => (w._id === id ? res.data : w)));
      cancelEditing();
    } catch (err) {
      console.error("❌ Failed to update workout:", err);
    }
  };

  return (
    <div className="workout-tracker">
      <h2>Workout Tracker</h2>

      <form onSubmit={handleSubmit} className="workout-entry">
        <input type="text" placeholder="Exercise" value={newWorkout.exercise} onChange={(e) => handleNewChange("exercise", e.target.value)} required />
        <input type="number" placeholder="Sets" value={newWorkout.sets} onChange={(e) => handleNewChange("sets", e.target.value)} required />
        <input type="number" placeholder="Reps" value={newWorkout.reps} onChange={(e) => handleNewChange("reps", e.target.value)} required />
        <input type="number" placeholder="Weight (kg)" value={newWorkout.weight} onChange={(e) => handleNewChange("weight", e.target.value)} required />
        <button type="submit">✅ Submit Workout</button>
      </form>

      <h3>Previous Workouts</h3>
      {workouts.length === 0 && <p>No workouts yet.</p>}
      <ul>
        {workouts.map((workout) => (
          <li key={workout._id}>
            {editingId === workout._id ? (
              <>
                <input type="text" value={editedWorkout.exercise} onChange={(e) => handleEditChange("exercise", e.target.value)} />
                <input type="number" value={editedWorkout.sets} onChange={(e) => handleEditChange("sets", e.target.value)} />
                <input type="number" value={editedWorkout.reps} onChange={(e) => handleEditChange("reps", e.target.value)} />
                <input type="number" value={editedWorkout.weight} onChange={(e) => handleEditChange("weight", e.target.value)} />
                <button onClick={() => saveEdit(workout._id)}>💾 Save</button>
                <button onClick={cancelEditing}>❌ Cancel</button>
              </>
            ) : (
              <>
                🏋️ {workout.exercise} – {workout.sets} x {workout.reps} @ {workout.weight}kg
                <button onClick={() => startEditing(workout)}>✏️ Edit</button>
                <button onClick={() => handleDelete(workout._id)}>🗑️ Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkoutTracker;
