const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes");
const trainingRoutes = require("./routes/trainingRoutes");
const trainingAttemptRoutes = require("./routes/trainingAttemptRoutes");
const certificationRoutes = require(
    "./routes/certificationRoutes"
);
const assessmentRoutes = require("./routes/assessmentRoutes");
const workerRoutes = require("./routes/workerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const siteOfficerRoutes = require("./routes/siteOfficerRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/training", trainingRoutes);
app.use(
    "/api/training-attempts",
    trainingAttemptRoutes
);
app.use(
    "/api/assessment",
    assessmentRoutes
);
app.use(
    "/api/certifications",
    certificationRoutes
);
app.use("/api/worker", workerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/site-officer", siteOfficerRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "SIH26041 Backend API is running"
    });
});

app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});