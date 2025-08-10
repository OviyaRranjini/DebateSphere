import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ViewDebate() {
  const { id } = useParams();
  const [debate, setDebate] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/debates/${id}`, { withCredentials: true })
      .then(res => setDebate(res.data))
      .catch(err => {
        console.error("Error loading debate:", err);
        setError(err.response?.data?.message || "Error fetching debate");
      });
  }, [id]);

  const handleRegister = async () => {
  setError("");
  setMessage("");
  setIsRegistering(true);

  try {
    const res = await axios.post(
      `http://localhost:5000/api/debates/${id}/register`,
      { debateId: id }, // ✅ Send the debateId in request body
      { withCredentials: true }
    );

    setMessage(res.data.message || "Successfully registered for the debate.");
  } catch (err) {
    console.error("Registration error:", err);
    setError(err.response?.data?.message || "Failed to register.");
  } finally {
    setIsRegistering(false);
  }
};


  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!debate) {
    return <div className="p-4">Loading debate...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md mt-8 rounded">
      <h1 className="text-3xl font-bold mb-4">{debate.title}</h1>
      <p className="mb-4 text-gray-700">{debate.description}</p>
      <div className="mb-2">
        <strong>Creator:</strong> {debate.creator}
      </div>
      <div className="mb-2">
        <strong>Date:</strong> {debate.event_date}
      </div>
      <div className="mb-2">
        <strong>Time:</strong> {debate.event_time}
      </div>
      <div className="mb-4">
        <strong>Duration:</strong> {debate.duration_minutes} minutes
      </div>

      <button
        onClick={handleRegister}
        disabled={isRegistering}
        className={`px-4 py-2 rounded text-white font-semibold ${
          isRegistering ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isRegistering ? "Registering..." : "Register"}
      </button>

      {message && (
        <div className="mt-4 text-green-600 font-medium">{message}</div>
      )}

      {error && (
        <div className="mt-4 text-red-600 font-medium">{error}</div>
      )}
    </div>
  );
}
