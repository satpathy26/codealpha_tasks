const express = require("express");

const router = express.Router();

const notificationController =
require("../controllers/notification.controller");

const { verifyToken } =
require("../middleware/auth.middleware");


// Get Notifications
router.get(
    "/",
    verifyToken,
    notificationController.getNotifications
);


// Mark as Read
router.patch(
    "/:id/read",
    verifyToken,
    notificationController.markAsRead
);


// Delete Notification
router.delete(
    "/:id",
    verifyToken,
    notificationController.deleteNotification
);

module.exports = router;