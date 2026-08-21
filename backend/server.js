const express = require("express");

const app = express();

const PORT = 5000;

app.get("/", (req, res) => {
    res.json({
        message: "Smart Hospital Management System API is running!"
    });
});

app.listen(PORT, () => {
    console.log(`SHMS backend running on http://localhost:${PORT}`);
});