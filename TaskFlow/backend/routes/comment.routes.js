const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/auth.middleware");

const commentController = require("../controllers/comment.controller");

// Create Comment
router.post(
    "/",
    verifyToken,
    commentController.createComment
);

// Get All Comments of a Task
router.get(
    "/task/:taskId",
    verifyToken,
    commentController.getTaskComments
);

// Update Comment
router.put(
    "/:id",
    verifyToken,
    commentController.updateComment
);

// Delete Comment
router.delete(
    "/:id",
    verifyToken,
    commentController.deleteComment
);

module.exports = router;