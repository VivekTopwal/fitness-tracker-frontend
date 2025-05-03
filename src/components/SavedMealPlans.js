import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { marked } from "marked";

const SavedMealPlans = ({ token }) => {
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visiblePlans, setVisiblePlans] = useState({}); // for toggling visibility

  const fetchSavedMealPlans = useCallback(async () => {
    const res = await axios.get("http://localhost:5000/api/ai-meal/saved", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.savedMealPlans;
  }, [token]);

  const deleteSavedMealPlan = async (id) => {
    await axios.delete(`http://localhost:5000/api/ai-meal/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const getPlans = useCallback(async () => {
    try {
      const plans = await fetchSavedMealPlans();
      setSavedPlans(plans);
    } catch (err) {
      console.error("Error fetching saved plans:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchSavedMealPlans]);

  const handleDelete = async (id) => {
    try {
      await deleteSavedMealPlan(id);
      setSavedPlans(savedPlans.filter((plan) => plan._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const toggleVisibility = (id) => {
    setVisiblePlans((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    getPlans();
  }, [getPlans]);

  if (loading) return <p>Loading saved plans...</p>;

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-4">🍽️ Saved Meal Plans</h2>
      {savedPlans.length === 0 ? (
        <p>No saved meal plans.</p>
      ) : (
        <div className="grid gap-4">
          {savedPlans.map((item) => (
            <div key={item._id} className="bg-white dark:bg-red-50 p-4 rounded-xl shadow">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => toggleVisibility(item._id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  {visiblePlans[item._id] ? "Hide" : "View"}
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  🗑️ Delete
                </button>
              </div>

              {visiblePlans[item._id] && (
                <div
                  className="prose dark:prose-invert max-w-none mt-2"
                  dangerouslySetInnerHTML={{ __html: marked.parse(item.plan) }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedMealPlans;
