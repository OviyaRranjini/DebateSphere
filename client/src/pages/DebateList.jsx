// src/pages/DebatePage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';

export default function DebatePage() {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null); // logged-in user ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get logged-in user info
        const userRes = await apiClient.get('/auth/check');
        setUserId(userRes.data.user.id);

        // Fetch debates
        const debateRes = await apiClient.get('/debates');
        setDebates(debateRes.data);
        // console.log(debate+" ");
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load debates.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (debateId) => {
    if (!window.confirm('Are you sure you want to delete this debate?')) return;
    try {
      await apiClient.delete(`/debates/${debateId}`);
      setDebates(debates.filter((d) => d.id !== debateId));
    } catch (err) {
      alert('Delete failed.');
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading debates...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;
  if (debates.length === 0) return <p className="text-center mt-10">No debates found.</p>;
  // debates.forEach(debate => {
  //   console.log("Logged-in user ID:", userId, "Debate user_id:", debate.user_id);
  // });


  return (
    <div className="flex justify-center mt-10">
      <div className="w-full max-w-5xl px-4">
        <h1 className="text-3xl font-bold text-center mb-8">All Debates</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {debates.map((debate) => (
            
            <div
              key={debate.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center"
            >
              <h2 className="text-xl font-semibold mb-2">{debate.title}</h2>
              <p className="text-gray-700 mb-4">{debate.description}</p>

              <Link
                to={`/debates/${debate.id}`}
                className="inline-block text-blue-600 hover:underline font-medium mb-2"
              >
                View Details
              </Link>

              {/* Delete button shown only if current user is the creator */}
              {debate.user_id == userId && (
                <button
                  onClick={() => handleDelete(debate.id)}
                  className="block mt-2 text-red-600 font-semibold hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
