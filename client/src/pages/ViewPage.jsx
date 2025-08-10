import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';


export default function ChatRoom() {
  const { debateKey } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  useEffect(() => {
    // ✅ Use /api/auth/check instead of /me
    axios
      .get('http://localhost:5000/api/auth/check', { withCredentials: true })
      .then((res) => {
        if (res.data?.user?.email) {
          setCurrentUserEmail(res.data.user.email);
        }
      })
      .catch((err) => {
        console.error('Auth check failed:', err);
        setCurrentUserEmail('');
      });
  }, []);
  const socket = io('http://localhost:5000', {
  withCredentials: true,
});
  useEffect(() => {
    if (!debateKey) return;

    socket.emit('join_debate_room', { debateId: debateKey });

    socket.on('receive_message', ({ message }) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.emit('leave_room', { room: debateKey });
      socket.off('receive_message');
    };
  }, [debateKey]);

  const handleSend = () => {
     console.log('Message sent:', input);
      console.log('Current user email:', currentUserEmail);
      console.log('Debate key:', debateKey);
    if (!input.trim()) return;

    socket.emit('send_message', {
      room: debateKey,
      message: {
        text: input,
      },
    });
   
    setInput('');
  };

  const renderMessage = (msg, index) => {
    const isCurrentUser = msg.user === currentUserEmail;
    const displayName = msg.user?.split('@')[0] || 'Unknown';

    return (
      <div
        key={index}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}
      >
        <div
          className={`max-w-xs px-4 py-2 rounded-lg shadow ${
            isCurrentUser
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }`}
        >
          <div className="text-xs font-semibold mb-1">{displayName}</div>
          <div>{msg.text}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Debate Room: {debateKey}</h2>

      <div className="flex-1 overflow-y-auto bg-white p-4 rounded shadow mb-4">
        {messages.length === 0 && (
          <div className="text-gray-500 text-center">No messages yet</div>
        )}
        {messages.map((msg, idx) => renderMessage(msg, idx))}
      </div>

      <div className="flex">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-l px-4 py-2"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-6 py-2 rounded-r hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
