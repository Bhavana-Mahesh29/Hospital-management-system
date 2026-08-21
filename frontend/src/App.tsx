import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch((error) => {
        console.error("Error connecting to backend:", error);
        setMessage("Could not connect to backend");
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