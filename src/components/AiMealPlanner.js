import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Loader2, Utensils } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const AiMealPlanner = () => {
  const [goal, setGoal] = useState("");
  const [cuisine, setCuisine] = useState("Any");
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateMealPlan = async () => {
    if (!goal) return;
    setLoading(true);
    setResponse("");

    const requestBody = { goal, cuisine, mealsPerDay };

    try {
      const res = await axios.post("http://localhost:5000/api/ai-meal/generate", requestBody);
      setResponse(res.data.plan);
    } catch (err) {
      console.error("Frontend error:", err);
      setResponse("⚠️ Error getting meal plan.");
    } finally {
      setLoading(false);
    }
  };
  const handleSaveMealPlan = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/ai-meal/save", {
        plan: response,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // or however you're storing it
        },
      });
  
      alert("✅ Meal plan saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Failed to save meal plan.");
    }
  };
  
  return (
    <Card className="rounded-2xl p-6 shadow-lg bg-white dark:bg-zinc-900 mt-10 max-w-3xl mx-auto">
      <CardContent>
        <div className="flex items-center gap-2 mb-6">
          <Utensils className="text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">
            AI Meal Planner 🍽️
          </h2>
        </div>

        <Textarea
          className="mb-4 text-sm"
          placeholder="Enter your goal, e.g. 'Lose weight with low carb diet'"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white"
          >
            <option>Any</option>
            <option>Indian</option>
            <option>Mediterranean</option>
            <option>Vegetarian</option>
            <option>Vegan</option>
            <option>Keto</option>
          </select>

          <input
            type="number"
            min={1}
            max={6}
            value={mealsPerDay}
            onChange={(e) => setMealsPerDay(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white"
            placeholder="Meals per day"
          />
        </div>

        <Button
          onClick={handleGenerateMealPlan}
          disabled={loading}
          className="mb-6 w-full sm:w-auto"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
          ) : (
            "Generate Plan"
          )}
        </Button>

        {response && (
          <>
            <div className="mt-6 p-4 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Utensils className="w-5 h-5" />
                Your AI-Generated Meal Plan
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </div>

            <Button
              onClick={() => navigator.clipboard.writeText(response)}
              className="mt-4"
            >
              Copy Plan
            </Button>

            <Button
  onClick={handleSaveMealPlan}
  disabled={!response || loading}
  className="ml-2 mt-4"
>
  Save Meal Plan
</Button>

          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AiMealPlanner;
