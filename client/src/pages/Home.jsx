import React from "react";
import { Link } from "react-router-dom"; // Assuming you have React Router for navigation

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8">
      <div className="text-center max-w-3xl">
        <h1 className="text-6xl font-extrabold mb-6 drop-shadow-lg leading-tight">
          Welcome to the <br /> Online Debate Platform
        </h1>
        <p className="text-2xl font-light mb-10 opacity-90">
          Where ideas collide, voices are heard, and discussions shape understanding.
          <br /> Engage in live debates, post new topics, and join the conversation!
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link
            to="/debates" // Replace with your actual path to debate list
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out"
          >
            Explore Debates
          </Link>
          <Link
            to="/add" // Replace with your actual path to add new debate
            className="bg-purple-700 text-white hover:bg-purple-800 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out"
          >
            Start a New Debate
          </Link>
        </div>
      </div>
    </div>
  );
}