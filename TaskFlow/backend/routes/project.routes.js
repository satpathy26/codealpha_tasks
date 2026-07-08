const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/auth.middleware");

const {
    createProject,
    getMyProjects,
    getProject,
    updateProject,
    deleteProject
} = require("../controllers/project.controller");

router.post("/", verifyToken, createProject);
router.get("/", verifyToken, getMyProjects);
router.get("/:id", verifyToken, getProject);
router.put("/:id", verifyToken, updateProject);
router.delete("/:id", verifyToken, deleteProject);
module.exports = router;