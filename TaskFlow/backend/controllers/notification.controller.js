const notificationModel = require("../models/notification.model");


// Get Notifications
exports.getNotifications = async (req, res) => {

    try {

        const notifications =
            await notificationModel.getNotifications(req.user.id);

        res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};


// Mark Notification as Read
exports.markAsRead = async (req, res) => {

    try {

        const { id } = req.params;

        const result =
            await notificationModel.markAsRead(id);

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });

        }

        res.json({
            success: true,
            message: "Notification marked as read"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};


// Delete Notification
exports.deleteNotification = async (req, res) => {

    try {

        const { id } = req.params;

        const result =
            await notificationModel.deleteNotification(id);

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });

        }

        res.json({
            success: true,
            message: "Notification deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};