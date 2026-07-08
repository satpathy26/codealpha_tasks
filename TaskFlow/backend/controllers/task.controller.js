const taskModel = require("../models/task.model");

const notificationModel =
require("../models/notification.model");

exports.createTask = async (req, res) => {

    try {

        const {
            projectId,
            title,
            description,
            priority,
            assignedTo,
            dueDate
        } = req.body;

        if (!projectId || !title) {
            return res.status(400).json({
                success: false,
                message: "Project ID and Title are required"
            });
        }

        const result = await taskModel.createTask(
            projectId,
            title,
            description,
            priority,
            req.user.id,
            assignedTo,
            dueDate
        );

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            taskId: result.insertId
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

exports.getTasksByProject = async (req, res) => {

    try {

        const tasks = await taskModel.getTasksByProject(
            req.params.projectId
        );

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

exports.getTaskById = async (req, res) => {

    try {

        const { id } = req.params;

        const task = await taskModel.getTaskById(id);

        if (task.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            task: task[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

exports.updateTask = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            title,
            description,
            priority,
            assignedTo,
            dueDate
        } = req.body;

        const result = await taskModel.updateTask(
            id,
            title,
            description,
            priority,
            assignedTo,
            dueDate
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Task updated successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

exports.deleteTask = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await taskModel.deleteTask(id);

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Task not found"
            });

        }

        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

exports.assignTask = async (req, res) => {

    try {

        const { id } = req.params;
        const { assignedTo } = req.body;

        const result = await taskModel.assignTask(
            id,
            assignedTo
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Get task details
        const task = await taskModel.getTaskById(id);

        // Create notification
        await notificationModel.createNotification(
            assignedTo,
            task[0].project_id,
            task[0].id,
            `You have been assigned a new task: ${task[0].title}`
        );

        res.json({
            success: true,
            message: "Task assigned successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

exports.updateTaskStatus = async (req, res) => {

    try {

        const { id } = req.params;
        const { status } = req.body;

        const result =
        await taskModel.updateTaskStatus(
            id,
            status
        );
        // Send notification only when task is completed
if (status === "Done") {

    const task = await taskModel.getTaskById(taskId);

    if (
        task.length > 0 &&
        task[0].assigned_to &&
        task[0].assigned_to != req.user.id
    ) {

        await notificationModel.createNotification(
            task[0].assigned_to,
            task[0].project_id,
            taskId,
            `Task "${task[0].title}" has been marked as completed.`
        );

    }

}
        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message: "Task not found"

            });

        }

        res.json({

            success: true,

            message: "Status updated successfully"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

};
exports.updatePriority = async (req, res) => {

    try {

        const { id } = req.params;
        const { priority } = req.body;

        const result =
        await taskModel.updatePriority(
            id,
            priority
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message: "Task not found"

            });

        }

        res.json({

            success: true,

            message: "Priority updated successfully"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

};