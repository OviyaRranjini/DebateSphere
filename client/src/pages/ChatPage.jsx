// src/pages/VerifyPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaKey } from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../utils/apiClient';

export default function VerifyPage() {
 const [debateKey, setDebateKey] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getStatus = (dateString, timeString, duration) => {
    if (!dateString || !timeString || !duration) return 'invalid';

    const datePart = new Date(dateString).toLocaleDateString('en-CA'); // e.g., "2025-08-07"
    const startTime = new Date(`${datePart}T${timeString}`);

    if (isNaN(startTime.getTime())) return 'invalid';

    const now = new Date();
    const bufferBeforeStart = new Date(startTime.getTime() - 1 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + (duration + 1) * 60 * 1000);

    if (now < bufferBeforeStart) return 'not_started';
    if (now >= bufferBeforeStart && now <= endTime) return 'active';
    return 'expired';
  };

 const handleJoin = async (e) => {
  e.preventDefault();
  setError('');

  if (!debateKey || !otp) {
    setError('Please enter both Debate Key and OTP');
    return;
  }

  if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    setError('OTP must be a 6-digit number.');
    return;
  }

  try {
    setIsLoading(true);

    const debateRes = await apiClient.get(`/debates/byKey/${debateKey}`);
    const debate = debateRes.data.data; // ✅ FIXED

    if (!debate) {
      setError('Debate not found.');
      return;
    }

    const status = getStatus(debate.event_date, debate.event_time, debate.duration_minutes);

    if (status !== 'active') {
      setError(`Debate is currently ${status}. You can only join when it's live.`);
      return;
    }

    const otpRes = await apiClient.post('/debates/otp/verify', {
      debateKey,
      otp,
    });

    if (otpRes.data?.success) {
      toast.success('Verification successful!');
      navigate(`/chat/${debateKey}`);
    } else {
      setError(otpRes.data.message || 'OTP verification failed.');
    }
  } catch (err) {
    console.error('Join error:', err);
    setError(err.response?.data?.message || 'Server error.');
  } finally {
    setIsLoading(false);
  }
};


const handleSendOtp = async () => {
  setError('');

  if (!debateKey) {
    setError('Please enter a Debate Key to send OTP.');
    return;
  }

  try {
    setIsLoading(true);

    const res = await apiClient.post('/debates/otp/send', { debateKey });

    if (res.data.success) {
      toast.success('OTP sent successfully!');
    } else {
      setError(res.data.message || 'Failed to send OTP.');
    }
  } catch (err) {
    console.error('Send OTP error:', err);
    setError(err.response?.data?.message || 'Failed to send OTP.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <ToastContainer />
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Join a Debate
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin}>
          <div className="mb-4">
            <label htmlFor="debateId" className="block text-gray-700 text-sm font-bold mb-2">
              Debate ID
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <FaLock />
              </span>
              <input
                id="debateId"
                type="text"
                className="pl-10 pr-3 py-2 w-full border rounded"
                placeholder="Enter Debate Key"
                value={debateKey}
                onChange={(e) =>  setDebateKey(e.target.value)}
                disabled={isLoading}
                autoComplete="off"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isLoading}
            className={`mb-4 w-full ${isLoading ? 'bg-gray-400' : 'bg-yellow-500'} text-white font-bold py-2 px-4 rounded`}
          >
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </button>

          <div className="mb-6">
            <label htmlFor="otp" className="block text-gray-700 text-sm font-bold mb-2">
              OTP
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <FaKey />
              </span>
              <input
                id="otp"
                type="password"
                className="pl-10 pr-3 py-2 w-full border rounded"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isLoading}
                autoComplete="one-time-code"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${isLoading ? 'bg-gray-400' : 'bg-blue-600'} text-white font-bold py-2 px-4 rounded`}
          >
            {isLoading ? 'Verifying...' : 'Verify & Join'}
          </button>
        </form>
      </div>
    </div>
  );
}
