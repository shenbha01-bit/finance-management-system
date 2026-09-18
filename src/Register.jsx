import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // (or react-router-dom)
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username.trim() || !password || !confirmPassword) {
      setMessage("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      // ✅ FIRST Check Status before parsing JSON
      if (!response.ok) {
        const errorText = await response.text(); // Safe for HTML/text response
        console.error("Server Error Response:", errorText);
        setMessage(`Error ${response.status}: Route not found or Server issue`);
        return;
      }

      const data = await response.json();
      setMessage("Account created successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      setMessage("Unable to connect to backend");
    }
  };

  return (
    <div className="register-page">
      <div className="register-box">
        <h1>Create Account</h1>
        <p>Finance Management System</p>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {message && <p className="register-message">{message}</p>}
          <button type="submit">Create Account</button>
        </form>
      </div>
    </div>
  );
}

export default Register;