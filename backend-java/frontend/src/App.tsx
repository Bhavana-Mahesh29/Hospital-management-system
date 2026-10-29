import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBackend = async () => {
      // 1. Try relative /api endpoint (works on port 3000 in AI Studio and production)
      try {
        const response = await fetch("/api");
        if (response.ok) {
          const data = await response.json();
          if (data && data.message) {
            setMessage(data.message);
            return;
          }
        }
      } catch (err) {
        // Fallback
      }

      // 2. Try direct http://localhost:5000/ (works in local development if backend is on 5000)
      try {
        const response = await fetch("http://localhost:5000/");
        if (response.ok) {
          const data = await response.json();
          if (data && data.message) {
            setMessage(data.message);
            return;
          }
        }
      } catch (err) {
        // Fallback
      }

      // 3. Try /api/health
      try {
        const response = await fetch("/api/health");
        if (response.ok) {
          const data = await response.json();
          if (data && data.message) {
            setMessage(data.message);
            return;
          }
        }
      } catch (err) {
        // All failed
      }

      console.error("Error connecting to backend");
      setMessage("Could not connect to backend");
    };

    fetchBackend();
  }, []);

  return (
    <div>
      <h1>Smart Hospital Management System</h1>

      <p>Frontend: React + TypeScript</p>

      <p>Backend response:</p>

      <strong>{message}</strong>
    </div>
  );
}

export default App;