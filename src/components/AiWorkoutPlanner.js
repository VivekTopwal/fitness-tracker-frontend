import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import axios from "axios";
import { Textarea } from "./ui/textarea";
import { Loader2, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

const AiWorkoutPlanner = () => {
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [equipment, setEquipment] = useState("Bodyweight");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL = process.env.REACT_APP_API_URL;

  const handleSuggestWorkout = async () => {
    if (!goal) return;
    setLoading(true);
    setResponse("");

    const requestBody = {
      goal,
      level,
      equipment,
      daysPerWeek,
    };

    try {
      const res = await axios.post(`${BASE_URL}/api/ai-workout/generate`, requestBody);
      setResponse(res.data.plan);
    } catch (err) {
      console.error("Frontend error:", err);
      setResponse("⚠️ Error getting workout plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl p-6 shadow-lg bg-white dark:bg-zinc-900 mt-10 max-w-3xl mx-auto">
      <CardContent>
        <div className="flex items-center gap-2 mb-6">
          <Bot className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">
            AI Workout Suggestion
          </h2>
        </div>

        <Textarea
          className="mb-4 text-sm"
          placeholder="Enter your goal, e.g. 'Build muscle 4x/week at home'"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

          <select
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white"
          >
            <option>Bodyweight</option>
            <option>Minimal Equipment</option>
            <option>Full Gym</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Days per week:
          </label>
          <input
            type="number"
            min={1}
            max={7}
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <Button
          onClick={handleSuggestWorkout}
          disabled={loading}
          className="mb-6 w-full sm:w-auto"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
          ) : (
            "Get Plan"
          )}
        </Button>

        {response && (
          <div className="mt-6 p-4 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Bot className="w-5 h-5" />
              Your AI-Generated Plan
            </h3>
            <div className="prose dark:prose-invert max-w-none max-h-[400px] overflow-y-auto pr-2">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
            <Button
              onClick={() => navigator.clipboard.writeText(response)}
              className="mt-4"
            >
              Copy Plan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiWorkoutPlanner;
