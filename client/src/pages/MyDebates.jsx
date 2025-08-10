import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';
import { useNavigate } from 'react-router-dom';

export default function MyDebates() {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDebates = async () => {
      try {
        const res = await apiClient.get('/debates/mine');
        setDebates(res.data);
      } catch (err) {
        console.error('Error fetching my debates:', err);
        setError(err.response?.data?.message || 'Failed to load your debates.');
      } finally {
        setLoading(false);
      }
    };

    fetchDebates();
  }, []);

 const getStatus = (dateString, timeString, duration) => {
  if (!dateString || !timeString || !duration) return 'invalid';

  // ✅ Extract local date in 'YYYY-MM-DD' format
  const datePart = new Date(dateString).toLocaleDateString('en-CA'); // e.g., "2025-08-07"

  // ✅ Combine local date and time into a full DateTime
  const startTime = new Date(`${datePart}T${timeString}`);

  if (isNaN(startTime.getTime())) return 'invalid';

  const now = new Date();
  const bufferBeforeStart = new Date(startTime.getTime() - 1 * 60 * 1000);
  const endTime = new Date(startTime.getTime() + (duration + 1) * 60 * 1000);

  // Debug logs
  // console.log('Split Date:', datePart);
  // console.log('startTime:', startTime);
  // console.log('endTime:', endTime);
  // console.log('now:', now);
  // console.log('bufferBeforeStart:', bufferBeforeStart);
  // console.log('Date:', dateString, 'Time:', timeString, 'Duration:', duration);

  if (now < bufferBeforeStart) return 'not_started';
  if (now >= bufferBeforeStart && now <= endTime) return 'active';
  return 'expired';
};





  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading your registered debates...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-600">{error}</p>;
  }

  if (debates.length === 0) {
    return <p className="text-center mt-10 text-gray-600">You haven't registered for any debates yet.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">My Registered Debates</h2>
      <ul className="space-y-4">
        {debates.map((debate) => {
          const status = getStatus(debate.event_date, debate.event_time, debate.duration_minutes);

          return (
            <li key={debate.id} className="p-4 border rounded shadow-sm">
              <h3 className="text-xl font-semibold">{debate.title}</h3>
              <p className="text-gray-600">{debate.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                <p><strong>Date:</strong> {new Date(debate.event_date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {debate.event_time}</p>
                <p><strong>Duration:</strong> {debate.duration_minutes} minutes</p>
              </div>

              <div className="mt-3">
                {status === 'active' && (
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    onClick={() => navigate('/chat')}
                  >
                    Chat
                  </button>
                )}
                {status === 'not_started' && (
                  <span className="inline-block px-4 py-2 bg-yellow-300 text-yellow-800 font-medium rounded">
                    Yet to Start
                  </span>
                )}
                {status === 'expired' && (
                  <span className="inline-block px-4 py-2 bg-red-300 text-red-800 font-medium rounded">
                    Expired
                  </span>
                )}
                {status === 'invalid' && (
                  <span className="inline-block px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded">
                    Date/Time Missing
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
