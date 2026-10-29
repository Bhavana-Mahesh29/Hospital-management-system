const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get(["/", "/api", "/api/health", "/api/status"], (req, res) => {
    res.json({
        message: "Smart Hospital Management System API is running!",
        status: "healthy",
        system: "CarePulse Clinical & EHR Scheduling System"
    });
});

app.listen(PORT, () => {
    console.log(`SHMS backend running on http://localhost:${PORT}`);
});