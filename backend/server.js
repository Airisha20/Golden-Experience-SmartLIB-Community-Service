require("dotenv").config();


const express = require("express");
const cors = require("cors");
const connectDB = require("./config");
const bookRoutes = require("./routes/bookRoutes");
const memberRoutes = require("./routes/memberRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/transactions", transactionRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("SmartLib Backend is running!");
});

// API health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "SmartLib API is working!"
    });
});

// Start server after connecting to MongoDB
const startServer = async () => {
    await connectDB();

    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
};

startServer();
