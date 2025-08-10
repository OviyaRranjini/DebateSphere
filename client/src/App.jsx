// src/App.jsx

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AddDebate from "./pages/AddDebate";
import DebateList from "./pages/DebateList";
// import DebatePage from "./pages/DebatesPage";
import ChatPage from "./pages/ChatPage";
import MyDebate from "./pages/MyDebates";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ViewDebate from "./pages/ViewDebate";
import ViewPage from "./pages/ViewPage";



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const showMessage = (message, type = "info") => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    showMessage("Logged out successfully", "info");
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans antialiased">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <main className="container mx-auto py-8">
          <Routes>
            {/* General */}
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<ChatPage />} />

            {/* Debates */}
            <Route path="/add" element={<AddDebate />} />
            <Route path="/debates" element={<DebateList/>} />
            {/* <Route path="/mine" element={<DebateList mine={true} />} /> */}
            {/* <Route path="/debates" element={<DebatePage />} /> */}
            <Route path="/mine" element={<MyDebate />} />

            {/* Auth */}
            <Route
              path="/login"
              element={
                <LoginPage
                  onAuthSuccess={handleLoginSuccess}
                  showMessage={showMessage}
                />
              }
            />
            <Route
              path="/signup"
              element={<SignupPage showMessage={showMessage} />}
            />
            <Route path="/chat/:debateKey" element={<ViewPage/>} />
            <Route path="/debates/:id" element={<ViewDebate />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
