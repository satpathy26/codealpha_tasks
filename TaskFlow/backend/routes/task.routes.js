const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/auth.middleware");

const taskController = require("../controllers/task.controller");

router.post(
    "/", verifyToken,
     taskController.createTask);

router.get(
    "/project/:projectId",
    verifyToken,
    taskController.getTasksByProject);

router.get(
    "/:id",
    verifyToken,
    taskController.getTaskById
);    

router.put(
    "/:id",
    verifyToken,
    taskController.updateTask
);

router.delete(
    "/:id",
    verifyToken,
    taskController.deleteTask
);

router.patch(
    "/:id/assign",
    verifyToken,
    taskController.assignTask
);

router.patch(
    "/:id/status",
    verifyToken,
    taskController.updateTaskStatus
);

router.patch(
    "/:id/priority",
    verifyToken,
    taskController.updatePriority
);

module.exports = router;