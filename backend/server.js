const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");

const app = express();


// =========================
// Middleware
// =========================

app.use(cors());
app.use(express.json());


// =========================
// Serve Frontend
// =========================

const frontendPath = path.join(__dirname, "../frontend");

app.use(express.static(frontendPath));


// =========================
// API Routes
// =========================

app.use("/api/auth", authRoutes);

app.use("/api/courses", courseRoutes);

app.use("/api/enrollments", enrollmentRoutes);


// =========================
// Home Page
// =========================

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});


// =========================
// Test Database
// =========================

app.get("/api/test-db", async (req, res) => {

    try {

        const [rows] = await db.query("SELECT 1 AS result");

        res.json({
            success: true,
            message: "MySQL connection successful",
            data: rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });

    }

});


// =========================
// Protected Test Route
// =========================

app.get("/api/protected", authMiddleware, (req, res) => {

    res.json({
        success: true,
        message: "You accessed a protected route",
        user: req.user
    });

});


// =========================
// Start Server
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {

    console.log(`Server running on port ${PORT}`);

});