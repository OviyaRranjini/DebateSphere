import React, { useState } from "react";
import axios from "axios";

export default function AddDebate() {
  const [debate, setDebate] = useState({
    title: "",
    description: "",
    creator: "",
    event_date: "",      // 🗓️ Date of the debate
    event_time: "",      // ⏰ Time of the debate
    duration_minutes: "" // ⏳ Duration in minutes
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleAdd = async () => {
    const { title, description, creator, event_date, event_time, duration_minutes } = debate;

    if (!title || !description || !creator || !event_date || !event_time || !duration_minutes) {
      setError("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(
        "http://localhost:5000/api/debates",
        {
          title,
          description,
          creator,
          date: event_date,
          time: event_time,
          minutes: duration_minutes,
        },
        {
          withCredentials: true,
        }
      );

      alert("Debate added successfully!");
      setDebate({
        title: "",
        description: "",
        creator: "",
        event_date: "",
        event_time: "",
        duration_minutes: ""
      });
    } catch (err) {
      console.error("Error adding debate:", err);
      setError(err.response?.data?.message || "Failed to add debate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputField = (id, label, type = "text") => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 font-bold mb-2">
        {label}
      </label>
      <input
        type={type}
        id={id}
        className="border rounded w-full px-3 py-2"
        value={debate[id]}
        onChange={(e) => setDebate({ ...debate, [id]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Add New Debate
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Oops!</strong> {error}
          </div>
        )}

        {inputField("title", "Debate Title")}
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-bold mb-2">
            Debate Description
          </label>
          <textarea
            id="description"
            rows="4"
            className="border rounded w-full px-3 py-2"
            value={debate.description}
            onChange={(e) => setDebate({ ...debate, description: e.target.value })}
          />
        </div>
        {inputField("creator", "Creator (Name/Org)")}
        {inputField("event_date", "Debate Date", "date")}
        {inputField("event_time", "Debate Time", "time")}
        {inputField("duration_minutes", "Duration (in minutes)", "number")}

        <button
          className={`w-full ${
            isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          } text-white font-bold py-2 px-4 rounded`}
          onClick={handleAdd}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding Debate..." : "Add Debate"}
        </button>
      </div>
    </div>
  );
}
