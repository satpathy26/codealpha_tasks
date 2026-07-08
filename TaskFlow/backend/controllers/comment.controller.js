const commentModel = require("../models/comment.model");
const notificationModel = require("../models/notification.model");
const taskModel = require("../models/task.model");
// Create Comment
exports.createComment = async (req, res) => {

    try {

        const { taskId, comment } = req.body;

        if (!taskId || !comment) {
            return res.status(400).json({
                success: false,
                message: "Task ID and comment are required"
            });
        }

        const result = await commentModel.createComment(
            taskId,
            req.user.id,
            comment
        );

        // Get task details
const task = await taskModel.getTaskById(taskId);

// Notify the assigned user (don't notify yourself)
if (
    task.length > 0 &&
    task[0].assigned_to &&
    task[0].assigned_to != req.user.id
) {
    await notificationModel.createNotification(
        task[0].assigned_to,
        task[0].project_id,
        taskId,
        `${req.user.username} commented on the task "${task[0].title}".`
    );
}


        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            commentId: result.insertId
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// Get All Comments of a Task
exports.getTaskComments = async (req, res) => {

    try {

        const { taskId } = req.params;

        const comments = await commentModel.getTaskComments(taskId);

        res.status(200).json({
            success: true,
            count: comments.length,
            comments
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// Update Comment
exports.updateComment = async (req, res) => {

    try {

        const { id } = req.params;

        const { comment } = req.body;

        if (!comment) {
            return res.status(400).json({
                success: false,
                message: "Comment is required"
            });
        }

        const result = await commentModel.updateComment(
            id,
            req.user.id,
            comment
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "You are not allowed to update it"
            });
        }

        res.status(200).json({
            success: true,
            message: "Comment updated successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// Delete Comment
exports.deleteComment = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await commentModel.deleteComment(
            id,
            req.user.id
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "You are not allowed to delete it"
            });
        }

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};