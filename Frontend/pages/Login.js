import React, { useState } from "react";
import Router from "next/router";
import Header from "../Components/Header";
import { SERVER_URL } from "../utils/const";

const Login = () => {
  const [username, setUsername] = useState(""); // Initialize to an empty string
  const [password, setPassword] = useState(""); // Initialize to an empty string
  const [loading, setLoading] = useState(false); // To manage button state
  const [error, setError] = useState(""); // To display errors to the user

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Input username and password");
      return;
    }

    setLoading(true); // Disable button during login attempt
    setError(""); // Reset error message

    try {
      const response = await fetch(`${SERVER_URL}/login`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Success: Store user and token, redirect to home
        localStorage.setItem("User", JSON.stringify(data.user));
        localStorage.setItem("Token", JSON.stringify(data.token));
        Router.push("/");
      } else {
        // Handle error response
        setError(data?.Error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false); // Re-enable the button after the request
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleLogin(); // Submit form on Enter key press
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col sn:min-h-[90vh] min-h-[80vh] w-full justify-center items-center">
        <div className="px-2 flex flex-col w-max justify-center items-center">
          <p className="my-5 bg-[#9b59b6] text-white w-full text-center py-2">
            Log In
          </p>
          {error && <p className="text-red-500 mb-3">{error}</p>}{" "}
          {/* Display error */}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            className="mb-3 p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="mb-3 p-2 border rounded"
          />
          <button
            onClick={handleLogin}
            disabled={loading} // Disable the button while loading
            className={`px-4 py-2 bg-purple-600 text-white rounded ${
              loading ? "opacity-50" : "hover:bg-purple-700"
            } transition`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;
