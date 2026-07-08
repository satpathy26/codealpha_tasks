

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");



dotenv.config();
require("./config/db");
const app = express();


//import
const authRoutes = require("./routes/auth.routes");

const projectRoutes = require("./routes/project.routes");

const taskRoutes = require("./routes/task.routes");

const memberRoutes = require("./routes/member.routes");

const commentRoutes = require("./routes/comment.routes");

const notificationRoutes = require("./routes/notification.routes");

app.use(cors({
    origin: "http://127.0.0.1:5500",
    credentials: true
}));


app.use(express.json());
app.use(cookieParser());

//Register routes

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", memberRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications",notificationRoutes);


app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TaskFlow Backend Running 🚀"
    });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});