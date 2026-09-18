import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Incorrect username");
      return;
    }

    if (!password) {
      setError("Incorrect password");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      navigate("/dashboard", {
        state: {
          username: data.username,
        },
      });
    } catch (error) {
      setError("Unable to connect to backend");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Finance Management System</h1>
        <p>Admin Login</p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit">Login</button>
        </form>

        <button
          type="button"
          className="create-account-btn"
          onClick={() => navigate("/register")}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

export default Login;