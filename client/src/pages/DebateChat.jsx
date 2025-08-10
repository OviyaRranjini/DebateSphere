import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

export default function DebateChat() {
  const { debateKey } = useParams(); // assuming you're using debateKey in URL
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Join the debate room
    socket.emit("join_debate_room", { debateId: debateKey });

    // Load past messages (optional, if stored in DB)
    axios
      .get(`http://localhost:5000/api/debates/${debateKey}/messages`, {
        withCredentials: true,
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Failed to load messages", err));

    // Listen for new messages
    socket.on("receive_message", ({ message }) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      // Leave room and clean up
      socket.emit("leave_room", { room: debateKey });
      socket.off("receive_message");
    };
  }, [debateKey]);

  useEffect(scrollToBottom, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      text: newMessage,
      timestamp: new Date().toISOString(),
      user: "You", // Replace with actual logged-in user name if available
    };

    // Emit to server
    socket.emit("send_message", {
      room: debateKey,
      message,
    });

    // Also add to local state immediately
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">💬 Debate Chat</h2>

      <div className="h-64 overflow-y-auto border border-gray-300 rounded p-3 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <span className="font-semibold text-blue-700">{msg.user}:</span>{" "}
            <span>{msg.text}</span>
            <div className="text-xs text-gray-500">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 border rounded-l"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
