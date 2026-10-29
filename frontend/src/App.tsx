import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // In AI Studio and production web environments, API runs on the same host under /api
    const apiUrl = '/api';
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setMessage(data.message || (data.status === 'healthy' ? 'Smart Hospital Management System API is running!' : JSON.stringify(data)));
      })
      .catch((error) => {
        console.error("Error connecting to backend:", error);
        // Fallback to /api/health
        fetch('/api/health')
          .then((res) => res.json())
          .then((data) => {
            setMessage(data.system ? `${data.system} is running (Healthy)!` : 'Connected to backend');
          })
          .catch((err2) => {
            console.error("Secondary backend check error:", err2);
            setMessage("Could not connect to backend");
          });
      });
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